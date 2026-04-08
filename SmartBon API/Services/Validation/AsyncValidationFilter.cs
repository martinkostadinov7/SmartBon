using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using FluentValidation;

/// <summary>
/// A global action filter that automatically validates incoming request payloads 
/// using FluentValidation before the controller action executes.
/// </summary>
public class AsyncValidationFilter : IAsyncActionFilter
{
    private readonly IServiceProvider _serviceProvider;

    public AsyncValidationFilter(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    /// <summary>
    /// Intercepts the action execution to run validation. 
    /// If validation fails, it short-circuits the pipeline and returns a 400 Bad Request with the validation errors.
    /// </summary>

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        foreach (var argument in context.ActionArguments.Values)
        {
            if (argument == null) continue;

            var validatorType = typeof(IValidator<>).MakeGenericType(argument.GetType());
            var validator = _serviceProvider.GetService(validatorType) as IValidator;

            if (validator != null)
            {
                var validationContext = new ValidationContext<object>(argument);
                var result = await validator.ValidateAsync(validationContext);

                if (!result.IsValid)
                {
                    context.Result = new BadRequestObjectResult(result.ToDictionary());
                    return;
                }
            }
        }

        await next();
    }
}