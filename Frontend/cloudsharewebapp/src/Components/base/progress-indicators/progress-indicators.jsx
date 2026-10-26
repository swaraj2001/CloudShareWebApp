
import { cx } from "../../../Utils/cx";

export const ProgressBarBase = ({
    value,
    min = 0,
    max = 100,
    className,
    progressClassName,
}) => {
    const percentage = ((value - min) * 100) / (max - min);

    return (
        <div
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin={min}
            aria-valuemax={max}
            className={cx(
                "h-2 w-full overflow-hidden rounded-md bg-quaternary",
                className
            )}
        >
            <div
                // Use transform instead of width to avoid layout thrashing
                // and for smoother animation
                style={{
                    transform: `translateX(-${100 - percentage}%)`,
                }}
                className={cx(
                    "size-full rounded-md bg-fg-brand-primary transition duration-75 ease-linear",
                    progressClassName
                )}
            />
        </div>
    );
};

export const ProgressBar = ({
    value,
    min = 0,
    max = 100,
    valueFormatter,
    labelPosition,
    className,
    progressClassName,
}) => {
    const percentage = ((value - min) * 100) / (max - min);

    const formattedValue = valueFormatter
        ? valueFormatter(value, percentage)
        : `${percentage.toFixed(0)}%`;

    const baseProgressBar = (
        <ProgressBarBase
            min={min}
            max={max}
            value={value}
            className={className}
            progressClassName={progressClassName}
        />
    );

    switch (labelPosition) {
        case "right":
            return (
                <div className="flex items-center gap-3">
                    {baseProgressBar}

                    <span className="shrink-0 text-sm font-medium text-secondary tabular-nums">
                        {formattedValue}
                    </span>
                </div>
            );

        case "bottom":
            return (
                <div className="flex flex-col items-end gap-2">
                    {baseProgressBar}

                    <span className="text-sm font-medium text-secondary tabular-nums">
                        {formattedValue}
                    </span>
                </div>
            );

        case "top-floating":
            return (
                <div className="relative flex flex-col items-end gap-2">
                    {baseProgressBar}

                    <div
                        style={{
                            left: `${percentage}%`,
                        }}
                        className="absolute -top-2 -translate-x-1/2 -translate-y-full rounded-lg bg-primary_alt px-3 py-2 shadow-lg ring-1 ring-secondary_alt"
                    >
                        <div className="text-xs font-semibold text-secondary tabular-nums">
                            {formattedValue}
                        </div>
                    </div>
                </div>
            );

        case "bottom-floating":
            return (
                <div className="relative flex flex-col items-end gap-2">
                    {baseProgressBar}

                    <div
                        style={{
                            left: `${percentage}%`,
                        }}
                        className="absolute -bottom-2 -translate-x-1/2 translate-y-full rounded-lg bg-primary_alt px-3 py-2 shadow-lg ring-1 ring-secondary_alt"
                    >
                        <div className="text-xs font-semibold text-secondary">
                            {formattedValue}
                        </div>
                    </div>
                </div>
            );

        default:
            return baseProgressBar;
    }
};

