<?php

namespace App\Logging;

use Monolog\Formatter\LineFormatter;

class PrettyLogFormatter
{
    /**
     * Customize the given logger instance.
     *
     * @param  \Illuminate\Log\Logger  $logger
     */
    public function __invoke($logger): void
    {
        // We only print the specific pieces we want: context_lines and exception.
        $formatter = new LineFormatter(
            "[%datetime%] %channel%.%level_name%\n".
            "================================================================\n".
            "Message: %message%\n".
            "Context:\n%context.context_lines%\n".
            "Exception:\n%context.exception%\n".
            "----------------------------------------------------------------\n\n",
            'd-m-Y H:i:s', // Chile-friendly date format
            true,          // allow inline line breaks
            true           // ignore empty context/extra
        );

        // If the exception object is passed in the context, this makes Monolog render the stack trace.
        $formatter->includeStacktraces(true);

        foreach ($logger->getHandlers() as $handler) {
            $handler->setFormatter($formatter);
        }
    }
}
