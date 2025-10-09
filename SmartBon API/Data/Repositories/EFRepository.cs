using Data.Interfaces;
using Data.Models;
using Microsoft.EntityFrameworkCore;
namespace Data.Repositories
{
    public class EFRepository<T> : IRepository<T> where T : class, IEntity
    {
        protected readonly AppDbContext _context;
        protected readonly DbSet<T> _dbSet;

        public EFRepository(AppDbContext context)
        {
            _context = context;
            _dbSet = _context.Set<T>();
        }
        public virtual async Task<T?> GetById(int id)
        {
            var query = this._dbSet.AsQueryable();

            return await query.SingleOrDefaultAsync(x => x.Id == id);
        }

        public virtual async Task<IEnumerable<T>> GetAll()
        {
            return await _dbSet.ToListAsync();
        }

        public virtual async Task<T> Add(T entity)
        {
            await _dbSet.AddAsync(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public virtual async Task<T> Update(T entity)
        {
            _context.Entry(entity).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return entity;
        }

        public virtual async Task Delete(T entity)
        {
            _dbSet.Remove(entity);
            await _context.SaveChangesAsync();
        }
    }
}
