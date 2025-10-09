using Data.Interfaces;
using Data.Repositories;
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
            return services;
        }
    }
}
