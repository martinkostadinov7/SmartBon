namespace Services.Interfaces
{
    /// <summary>
    /// Service for managing overarching user data operations.
    /// </summary>
    public interface IDataService
    {
        /// <summary> 
        /// Deletes all user-related data (expenses, budgets, goals, etc.) from the system, 
        /// usually invoked when a user resets their account or requests data deletion.
        /// </summary>
        Task<bool> DeleteAllData();
    }
}