using Data.Interfaces;
using Data.Repositories;
using Services.Budgets;
using Services.Categories;
using Services.Expenses;
using Services.Interfaces;
using Services.Subcategories;
using Services.Users;
using Services.UserServices;
namespace FeelBack.Api.Extentions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IUserService, UserService>();

            services.AddScoped<IExpenseRepository, ExpenseRepository>();
            services.AddScoped<IExpenseService, ExpenseService>();
            
            services.AddScoped<ICategoryRepository, CategoryRepository>();
            services.AddScoped<ICategoryService, CategoryService>();

            services.AddScoped<ISubcategoryService, SubcategoryService>();
            services.AddScoped<ISubcategoryRepository, SubcategoryRepository>();

            services.AddScoped<IBudgetRepository, BudgetRepository>();
            services.AddScoped<IBudgetService, BudgetService>();
            return services;
        }

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
    }
}
