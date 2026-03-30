using Data.Models;

namespace Services.Interfaces
{
    public interface IUserAccessor
    {
        int Id { get; }

        Task<User> GetUserAsync();
    }
}
