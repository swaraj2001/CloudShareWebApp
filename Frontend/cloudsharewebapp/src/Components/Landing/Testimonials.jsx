import { Star } from 'lucide-react';
import React from 'react';
import StarIcon from '../../assets/Icons/StarIcon';
const Testimonials = ({testimonials}) => {
  return (
    <div className="testimonials-section py-16 bg-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 ">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:transform hover:scale-105 transition duration-300">
              <div className="flex items-center mb-4 gap-5">
                  <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full mb-4"/>
                  <div>
                    <p className="font-bold">{testimonial.name}</p>
                    <p className="text-gray-500">{testimonial.role} , {testimonial.company}</p> 
                  </div>
              
              </div>
              <div className="flex items-center mt-4"> 
                {[...Array(5)].map((_, i) => (  
                    <StarIcon key={i} size={20} className={`${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`} />
                ))}
                
              </div>
              <blockquote className="mt-4"> 
                <p className="text-gray-600 italic mb-4 text-base ">"{testimonial.quote}"</p>
              </blockquote>
                
             
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Testimonials;
