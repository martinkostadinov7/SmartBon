using Data.Interfaces;
using Data.Repositories;
using Services.Expenses;
using Services.Interfaces;
using Services.UserServices;
namespace FeelBack.Api.Extentions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IExpenseRepository, ExpenseRepository>();
            services.AddScoped<IExpenseService, ExpenseService>();
            
            return services;
        }
    }
}
