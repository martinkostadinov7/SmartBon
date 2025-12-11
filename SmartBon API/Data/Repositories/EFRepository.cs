using Data.Interfaces;
using Data.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
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
            var query = _dbSet.AsQueryable();

            return await query.SingleOrDefaultAsync(x => EF.Property<int>(x, "Id") == id);
        }

        public virtual async Task<T?> GetById(int id, Expression<Func<T, object>>[]? includeProperties)
        {
            var query = _dbSet.AsQueryable();

            if (includeProperties != null)
            {
                foreach (var includeProperty in includeProperties)
                {
                    query = query.Include(includeProperty);
                }
            }

            return await query.SingleOrDefaultAsync(x => EF.Property<int>(x, "Id") == id);
        }

        public async Task<List<T>> GetAll()
        {
            IQueryable<T> query = _dbSet.AsQueryable();

            if (!await query.AnyAsync())
                throw new Exception("No entities were found.");

            var entities = query.ToList();

            return entities;
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
