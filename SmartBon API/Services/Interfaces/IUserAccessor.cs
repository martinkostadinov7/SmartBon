using Data.Models;
using System.Security.Claims;

namespace Services.Interfaces
{
    public interface IUserAccessor
    {
        int Id { get; }

        Task<User> GetUserAsync();
    }
}
