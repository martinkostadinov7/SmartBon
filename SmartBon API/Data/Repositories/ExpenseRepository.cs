using Data.Interfaces;
using Data.Models;

namespace Data.Repositories
{
    public class ExpenseRepository(AppDbContext context) : EFRepository<Expense>(context), IExpenseRepository
    {

    }
}
