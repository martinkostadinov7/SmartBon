using Data.Models;

namespace Services.Interfaces
{
    /// <summary>
    /// Utility service used to access the currently authenticated user's context from the HTTP Request (e.g., via JWT claims).
    /// </summary>
    public interface IUserAccessor
    {
        /// <summary> Gets the ID of the currently authenticated user. </summary>
        int Id { get; }

        /// <summary> Retrieves the full <see cref="User"/> entity for the currently authenticated user from the database. </summary>
        Task<User> GetUserAsync();
    }
}