
import { isValidElement } from "react";
import {
    Button as AriaButton,
    Link as AriaLink,
} from "react-aria-components";

import { Tooltip } from "../tooltip/tooltip";
import { cx } from "../../../Utils/cx";
import { isReactComponent } from "../../../Utils/is-react-component";

export const styles = {
    secondary:
        "bg-primary text-fg-quaternary shadow-xs-skeuomorphic ring-1 ring-primary ring-inset hover:bg-primary_hover hover:text-fg-quaternary_hover disabled:shadow-xs",

    tertiary:
        "text-fg-quaternary hover:bg-primary_hover hover:text-fg-quaternary_hover",
};

export const ButtonUtility = ({
    tooltip,
    className,
    isDisabled,
    icon: Icon,
    size = "sm",
    color = "secondary",
    tooltipPlacement = "top",
    ...props
}) => {
    const commonProps = {
        "aria-label": tooltip,
        ...props,
        isDisabled,

        className: cx(
            "group relative inline-flex h-max cursor-pointer items-center justify-center rounded-md p-1.5 outline-focus-ring transition duration-100 ease-linear focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50",

            styles[color],

            // Icon styles
            "*:data-icon:pointer-events-none *:data-icon:shrink-0 *:data-icon:text-current *:data-icon:transition-inherit-all",

            size === "xs"
                ? "*:data-icon:size-4"
                : "*:data-icon:size-5",

            className
        ),

        children: (
            <>
                {isReactComponent(Icon) && <Icon data-icon />}
                {isValidElement(Icon) && Icon}
            </>
        ),
    };

    let content;

    if ("href" in commonProps) {
        const { href: linkHref, ...rest } = commonProps;

        /*
         * An explicitly undefined href
         * renders a real button rather than
         * React Aria's link fallback.
         */
        content = linkHref ? (
            <AriaLink
                {...commonProps}
                href={isDisabled ? undefined : linkHref}
            />
        ) : (
            <AriaButton
                {...rest}
                type="button"
            />
        );
    } else {
        content = (
            <AriaButton
                {...commonProps}
                type={commonProps.type || "button"}
            />
        );
    }

    if (tooltip) {
        return (
            <Tooltip
                title={tooltip}
                placement={tooltipPlacement}
                isDisabled={isDisabled}
                offset={size === "xs" ? 4 : 6}
            >
                {content}
            </Tooltip>
        );
    }

    return content;
};

