using Data.Interfaces;
using Data.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
namespace Data.Repositories
{
    /// <inheritdoc />
    public class EFRepository<T> : IRepository<T> where T : class, IEntity
    {
        protected readonly AppDbContext _context;
        protected readonly DbSet<T> _dbSet;

        public EFRepository(AppDbContext context)
        {
            _context = context;
            _dbSet = _context.Set<T>();
        }

        /// <inheritdoc />
        public virtual async Task<T?> GetByIdAsync(int id)
        {
            var query = _dbSet.AsQueryable();

            return await query.SingleOrDefaultAsync(x => EF.Property<int>(x, "Id") == id);
        }

        /// <inheritdoc />
        public virtual async Task<T?> GetByIdAsync(int id, Expression<Func<T, object>>[]? includeProperties)
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

        /// <inheritdoc />
        public async Task<List<T>> GetAllAsync()
        {
            IQueryable<T> query = _dbSet.AsQueryable();

            var entities = await query.ToListAsync();

            return entities;
        }

        /// <inheritdoc />
        public virtual async Task<T> AddAsync(T entity)
        {
            await _dbSet.AddAsync(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        /// <inheritdoc />
        public virtual async Task<T> UpdateAsync(T entity)
        {
            _context.Entry(entity).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return entity;
        }

        /// <inheritdoc />
        public virtual async Task DeleteAsync(T entity)
        {
            _dbSet.Remove(entity);
            await _context.SaveChangesAsync();
        }

        /// <inheritdoc />
        public List<T> Find(Expression<Func<T, bool>> where, Expression<Func<T, object>>[] includeProperties = null, Func<IQueryable<T>, IOrderedQueryable<T>> orderByDescending = null)
        {
            var query = _dbSet.AsQueryable();
            
            query = query.Where(where);

            if (includeProperties != null)
            {
                foreach (var include in includeProperties)
                {
                    query = query.Include(include);
                }
            }

            if (orderByDescending != null)
            {
                query = orderByDescending(query);
            }

            return query.ToList();
        }

    }
}
