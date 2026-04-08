using FluentValidation;
using Services.Interfaces;
using Shared.DTOs.Expenses;

namespace Services.Validation.Expenses
{
    /// <summary>
    /// Validator for <see cref="ExpenseCreateDto"/> to ensure data integrity before creating an expense.
    /// </summary>
    public class ExpenseCreateValidator : AbstractValidator<ExpenseCreateDto>
    {
        private readonly ICategoryService _categoryService;

        /// <summary> Initializes validation rules for creating an expense. </summary>
        public ExpenseCreateValidator(ICategoryService categoryService)
        {
            _categoryService = categoryService;

            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Title is required.")
                .MaximumLength(100).WithMessage("Title cannot exceed 100 characters.");

            RuleFor(x => x.Description)
                .MaximumLength(200).WithMessage("Description cannot exceed 200 characters.");

            RuleFor(x => x.Cost)
                .NotEmpty().WithMessage("Cost is required.")
                .GreaterThan(0).WithMessage("Cost must be a positive value.");

            RuleFor(x => x.ExpenseDate)
                .NotEmpty().WithMessage("Expense date is required.");

            RuleFor(x => x.PaymentType)
                .IsInEnum().WithMessage("Invalid payment type provided.");

            RuleFor(x => x.Currency)
                .IsInEnum().WithMessage("Invalid currency provided.");

            RuleFor(x => x.CategoryId)
                .NotEmpty().WithMessage("Category is required.")
                .MustAsync(async (categoryId, cancellation) =>
                {
                    var categories = await _categoryService.GetCategoriesAsync();
                    return categories.Any(c => c.Id == categoryId);
                })
                .WithMessage("The selected category does not exist or you do not have permission to use it.");

            RuleFor(x => x.SubcategoryId)
                .MustAsync(async (model, subId, cancellation) =>
                {
                    if (!subId.HasValue) return true;

                    var categories = await _categoryService.GetCategoriesAsync();
                    var parentCategory = categories.FirstOrDefault(c => c.Id == model.CategoryId);

                    return parentCategory != null &&
                           parentCategory.Subcategories.Any(s => s.Id == subId.Value);
                })
                .WithMessage("The selected subcategory does not belong to the chosen category.");
        }
    }
}