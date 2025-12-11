using Data.Models;
namespace Data.Interfaces
{
    public interface IExpenseRepository : IRepository<Expense>
    {
        Task<List<Expense>> GetAll(int userId);
    }
}
