import React, { useContext, useEffect, useRef, useState } from "react";
import DashboardLayout from "../Layouts/DashboardLayout";
import { useAuth, useUser } from "@clerk/clerk-react";
import UserCreditContext from "../Context/UserCreditContext";
import axios from "axios";
import apiEndpoints from "../Utils/apiEndpoints";
import { AlertCircle, CheckCircle, CreditCard, Loader2 } from "lucide-react";

const Subscription = () => {
  const [processingPayment, setProcessingPayment] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const {user} = useUser();
  const razorpayScriptRef = useRef(null);

  const { getToken } = useAuth();

  const {
    credits,
    setCredits,
    fetchUserCredits: refreshCredits,
  } = useContext(UserCreditContext);

  // ==============================
  // Subscription Plans
  // ==============================

  const plans = [
    {
      id: "premium",
      name: "Premium",
      credits: 500,
      price: 500,
      currency: "₹",
      period: "",
      description: "Perfect for regular users",
      popular: true,
      buttonText: "Buy Premium",
      features: [
        "Upload up to 500 files",
        "Access all Basic features",
        "Priority support",
      ],
    },
    {
      id: "ultimate",
      name: "Ultimate",
      credits: 5000,
      price: 2500,
      currency: "₹",
      period: "",
      description: "For heavy file storage users",
      popular: false,
      buttonText: "Buy Ultimate",
      features: [
        "Upload up to 5000 files",
        "Access all Premium features",
        "Priority support",
      ],
    },
  ];

  // ==============================
  // Load Razorpay Script
  // ==============================

  useEffect(() => {
    if (window.Razorpay) {
      setRazorpayLoaded(true);
      return;
    }

    const script = document.createElement("script");

    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => {
      console.log("Razorpay script loaded successfully");
      setRazorpayLoaded(true);
    };

    script.onerror = () => {
      console.error("Failed to load Razorpay script");

      setMessage(
        "Payment gateway failed to load. Please refresh the page and try again.",
      );
      setMessageType("error");
    };

    document.body.appendChild(script);
    razorpayScriptRef.current = script;

    return () => {
      if (
        razorpayScriptRef.current &&
        document.body.contains(razorpayScriptRef.current)
      ) {
        document.body.removeChild(razorpayScriptRef.current);
      }
    };
  }, []);

  // ==============================
  // Fetch Current Credits
  // ==============================

  useEffect(() => {
    const loadCredits = async () => {
      try {
        const token = await getToken();

        const response = await axios.get(apiEndpoints.GET_CREDITS, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setCredits(response.data.credits);
      } catch (error) {
        console.error("Error fetching user credits:", error);

        setMessage(
          "Failed to load your current credits. Please try again later.",
        );
        setMessageType("error");
      }
    };

    loadCredits();
  }, [getToken, setCredits]);

  // ==============================
  // Handle Payment
  // ==============================

 const handlePayment = async (plan) => {
  if (processingPayment) {
    return;
  }

  if (!razorpayLoaded || !window.Razorpay) {
    setMessage(
      "Payment gateway is still loading. Please try again in a moment."
    );
    setMessageType("error");
    return;
  }

  try {
    setProcessingPayment(true);
    setMessage("");
    setMessageType("");

    const token = await getToken();

    console.log("Selected plan:", plan);

    // ==========================================
    // 1. Create Razorpay Order
    // ==========================================

    const orderResponse = await axios.post(
      apiEndpoints.CREATE_ORDER,
      {
        planId: plan.id,
        amount: plan.price * 100, // INR -> paise
        currency: "INR",
        credits: plan.credits,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const order = orderResponse.data;

    console.log("Created Razorpay order:", order);

    // ==========================================
    // 2. Validate Order Response
    // ==========================================

    if (!order) {
      throw new Error("Invalid order response from server");
    }

    const razorpayOrderId = order.orderId || order.id;

    if (!razorpayOrderId) {
      console.error("Invalid Razorpay order response:", order);
      throw new Error("Razorpay order ID is missing");
    }

    // ==========================================
    // 3. Razorpay Checkout
    // ==========================================

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY,

      amount: order.amount || plan.price * 100,

      currency: order.currency || "INR",

      name: "CloudShare",

      description: `Purchase ${plan.credits} Credits`,

      order_id: razorpayOrderId,

      handler: async function (response) {
        console.log("Razorpay payment response:", response);

        try {
          // ==========================================
          // 4. Verify Payment
          // ==========================================

          const verificationResponse = await axios.post(
            apiEndpoints.VERIFY_PAYMENT,
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId: plan.id,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          console.log(
            "Payment verification response:",
            verificationResponse.data
          );

          if (verificationResponse.data.success) {
            // Backend returned updated credits
            if (verificationResponse.data.credits !== undefined) {
              console.log(
                "Updating credits to:",
                verificationResponse.data.credits
              );

              setCredits(verificationResponse.data.credits);
            } else if (refreshCredits) {
              // Otherwise fetch latest credits
              console.log(
                "Credits not returned. Fetching latest credits..."
              );

              await refreshCredits();
            }

            setMessage(
              `Payment successful! ${plan.credits} credits have been added to your account.`
            );

            setMessageType("success");
          } else {
            setMessage(
              "Payment was completed, but verification failed. Please contact support."
            );

            setMessageType("error");
          }
        } catch (error) {
          console.error("Payment verification failed:", error);

          console.error(
            "Backend response:",
            error.response?.data
          );

          setMessage(
            error.response?.data?.message ||
              "Payment was completed, but verification failed. Please contact support."
          );

          setMessageType("error");
        } finally {
          setProcessingPayment(false);
        }
      },

      prefill: {
        name: user?.fullName || "",
        email: user?.primaryEmailAddress?.emailAddress || "",
        
      },

      theme: {
        color: "#7c3aed",
      },

      modal: {
        ondismiss: function () {
          console.log("Razorpay checkout closed");
          setProcessingPayment(false);
        },
      },
    };

    console.log("Razorpay options:", options);

    // ==========================================
    // 5. Open Razorpay
    // ==========================================

    const razorpay = new window.Razorpay(options);

    razorpay.on("payment.failed", function (response) {
      console.error("Payment failed:", response.error);

      setMessage(
        response.error?.description ||
          "Payment failed. Please try again."
      );

      setMessageType("error");
      setProcessingPayment(false);
    });

    razorpay.open();
  } catch (error) {
    console.error("Error creating payment:", error);

    console.error(
      "Backend response:",
      error.response?.data
    );

    console.error(
      "Status:",
      error.response?.status
    );

    console.error(
      "Request URL:",
      error.config?.url
    );

    setMessage(
      error.response?.data?.message ||
        error.response?.data ||
        "Unable to create payment. Please try again."
    );

    setMessageType("error");

    setProcessingPayment(false);
  }
};

  return (
    <DashboardLayout activeMenu="Subscriptions">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-bold">Subscription Plans</h1>

          <p className="text-gray-600">Choose a plan that works for you</p>
        </div>

        {/* Current Credits */}
        <div className="mb-8 flex items-center gap-3 rounded-lg bg-blue-50 p-4">
          <CreditCard className="text-purple-500" size={22} />

          <div>
            <h2 className="text-xl font-bold text-gray-600">Current Credits:  
             <span className= " p-1 text-purple-500">
              {credits ?? 0}
            </span>
            </h2>

           

            <p className="mt-2 text-sm text-gray-600">
              You can upload {credits ?? 0} more files with your current
              credits.
            </p>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 flex items-center gap-3 rounded-lg p-4 ${
              messageType === "error"
                ? "bg-red-50 text-red-700"
                : messageType === "success"
                  ? "bg-green-50 text-green-700"
                  : "bg-blue-50 text-blue-700"
            }`}
          >
            {messageType === "error" ? (
              <AlertCircle size={20} />
            ) : (
              <CheckCircle size={20} />
            )}

            <span>{message}</span>
          </div>
        )}

        {/* Plans */}
        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`flex flex-col overflow-hidden rounded-lg border shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                plan.popular ? "border-2 border-purple-500" : "border-gray-200"
              }`}
            >
              {/* Plan Header */}
              <div
                className={`bg-white px-6 py-8 ${
                  plan.popular
                    ? "bg-gradient-to-br from-purple-50 to-white"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-medium text-gray-900">
                    {plan.name}
                  </h3>

                  {plan.popular && (
                    <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800">
                      Recommended
                    </span>
                  )}
                </div>

                <p className="mt-4 text-sm text-gray-500">{plan.description}</p>

                {/* Price */}
                <div className="mt-6 flex items-baseline text-gray-900">
                  <span className="text-4xl font-extrabold tracking-tight">
                    {plan.currency}
                    {plan.price}
                  </span>

                  {plan.period && (
                    <span className="ml-1 text-sm font-semibold">
                      {plan.period}
                    </span>
                  )}
                </div>

                {/* Features */}
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500" />

                      <span className="ml-2 text-sm text-gray-500">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Payment Button */}
                <button
                  type="button"
                  onClick={() => handlePayment(plan)}
                  disabled={processingPayment}
                  className={`mt-8 w-full rounded-md px-4 py-3 text-sm font-medium transition-colors ${
                    plan.popular
                      ? "bg-purple-600 text-white hover:bg-purple-700"
                      : "border border-purple-600 bg-white text-purple-900 hover:border-transparent hover:bg-purple-500 hover:text-white"
                  } ${
                    processingPayment 
                      ? "cursor-not-allowed opacity-50"
                      : ""
                  }`}
                >
                  {processingPayment
                    ?(  <>
                            <Loader2 size={16} className="animate-spin"/> 
                            <span>Processing... </span>
                        </>
                     
                     ) 
                      : plan.buttonText}
                </button>
              </div>

            </div>
            
          ))}
          
        </div>
         <div className="mt-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-medium mb-2">
                  How credits work
                </h3>
                <p className="text-sm text-gray-600">
                     Each File upload consumes 1 credit. New users start with 5 credits.
                     Credits never expires and can be used any time. If you ran out of credits,
                     you can purchase more through  one of our plans above.
                </p>
              </div>
      </div>
    </DashboardLayout>
  );
};

export default Subscription;
