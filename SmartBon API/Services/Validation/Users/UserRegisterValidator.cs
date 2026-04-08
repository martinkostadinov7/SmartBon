using Data.Interfaces;
using FluentValidation;
using Shared.DTOs.Users;

namespace Services.Validation.Users
{
    /// <summary>
    /// Validator for <see cref="UserRegisterDto"/> to ensure data integrity and uniqueness before registering a new user.
    /// </summary>
    public class UserRegisterValidator : AbstractValidator<UserRegisterDto>
    {
        private readonly IUserRepository _userRepository;

        /// <summary> Initializes validation rules for user registration, including password strength and email uniqueness. </summary>
        public UserRegisterValidator(IUserRepository userRepository)
        {
            _userRepository = userRepository;
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required.")
                .EmailAddress().WithMessage("A valid email address is required.");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required.")
                .MinimumLength(8).WithMessage("Password must be at least 8 characters long.")
                .Matches(@"[A-Z]").WithMessage("Password must contain at least one uppercase letter.")
                .Matches(@"[a-z]").WithMessage("Password must contain at least one lowercase letter.")
                .Matches(@"[0-9]").WithMessage("Password must contain at least one number.");

            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Name is required.")
                .MaximumLength(50).WithMessage("Name cannot exceed 50 characters.");

            RuleFor(x => x.IsPremium)
                .NotNull().WithMessage("Premium status must be specified.");

            RuleFor(x => x.DefaultCurrency)
                .IsInEnum().WithMessage("Invalid currency selection.");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required.")
                .EmailAddress().WithMessage("Invalid email format.")
                .MustAsync(async (email, cancellation) =>
                {
                    bool isTaken = _userRepository.GetByEmail(email) != null;
                    return !isTaken;
                })
                .WithMessage("This email is already registered.");
        }
    }
}