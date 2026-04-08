using Data.Interfaces;
using Data.Repositories;
using FluentValidation;
using Services.Budgets;
using Services.Categories;
using Services.Data;
using Services.EmailSending;
using Services.Expenses;
using Services.Goals;
using Services.Interfaces;
using Services.Statistics;
using Services.Subcategories;
using Services.Users;
using Services.UserServices;
using Services.Validation.Expenses;
namespace FeelBack.Api.Extentions
{
    /// <summary>
    /// Provides extension methods for IServiceCollection to cleanly register application services, 
    /// repositories, mappers, and validators into the dependency injection (DI) container.
    /// </summary>
    public static class ServiceCollectionExtensions
    {
        /// <summary> Registers all repositories and business logic services required by the application. </summary>
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IUserService, UserService>();

            services.AddScoped<IExpenseRepository, ExpenseRepository>();
            services.AddScoped<IExpenseService, ExpenseService>();
            
            services.AddScoped<IRecurringExpenseRepository, RecurringExpenseRepository>();
            
            services.AddScoped<ICategoryRepository, CategoryRepository>();
            services.AddScoped<ICategoryService, CategoryService>();

            services.AddScoped<ISubcategoryService, SubcategoryService>();
            services.AddScoped<ISubcategoryRepository, SubcategoryRepository>();

            services.AddScoped<IBudgetRepository, BudgetRepository>();
            services.AddScoped<IBudgetService, BudgetService>();

            services.AddScoped<IGoalRepository, GoalRepository>();
            services.AddScoped<IGoalContributionRepository, GoalContributionRepository>();

            services.AddScoped<IGoalService, GoalService>();
            services.AddScoped<IGoalContributionService, GoalContributionService>();
            
            services.AddScoped<IStatisticsService, StatisticsService>();

            services.AddScoped<IEmailSendingService, EmailSendingService>();

            services.AddScoped<IDataService, DataService>();
            
            return services;
        }

        /// <summary> Registers AutoMapper profiles for converting between Domain Models and DTOs. </summary>
        public static IServiceCollection AddApplicationAutoMapper(this IServiceCollection services)
        {
            services.AddAutoMapper(cfg =>
            {
                cfg.AddMaps(typeof(UserProfile));
                cfg.AddMaps(typeof(ExpenseProfile));
                cfg.AddMaps(typeof(CategoryProfile));
            });

            return services;
        }

        /// <summary> Registers all FluentValidation validators found within the application assembly. </summary>
        public static IServiceCollection AddApplicationValidators(this IServiceCollection services)
        {
            services.AddValidatorsFromAssemblyContaining<ExpenseCreateValidator>();

            return services;
        }
    }
}
