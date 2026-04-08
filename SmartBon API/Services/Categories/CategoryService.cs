using AutoMapper;
using Data.Interfaces;
using Data.Models;
using Services.Interfaces;
using Shared.ApiExceptions;
using Shared.DTOs.Categories;
namespace Services.Categories
{
    /// <inheritdoc />
    public class CategoryService(IUserAccessor user, ICategoryRepository categoryRepository, IMapper mapper) : ICategoryService
    {
        /// <inheritdoc />
        public async Task<CategoryReadDto> CreateCategoryAsync(CategoryCreateDto categoryCreateDto)
        {
            Category category = mapper.Map<Category>(categoryCreateDto);
            category.UserId = user.Id;
            await categoryRepository.AddAsync(category);

            return mapper.Map<CategoryReadDto>(category);
        }

        /// <inheritdoc />
        public async Task<List<CategoryReadDto>> GetCategoriesAsync()
        {
            List<Category> categoriesFromDb = await categoryRepository.GetAllAsync(user.Id);  

            return mapper.Map<List<CategoryReadDto>>(categoriesFromDb);
        }

        /// <inheritdoc />
        public async Task<CategoryReadDto> GetCategoryByIdAsync(int id)
        {
            Category categoryFromDb = await categoryRepository.GetByIdAsync(id, [x => x.Subcategories]) ?? throw new NotFoundException($"Category with id {id} was not found");
            if (user.Id != categoryFromDb.UserId)
            {
                throw new UnauthorizedException("User does not have permission to vview this content!");
            }
            return mapper.Map<CategoryReadDto>(categoryFromDb);
        }

        /// <inheritdoc />
        public async Task<CategoryReadDto> DeleteCategoryAsync(int id)
        {
            Category categoryFromDb = await categoryRepository.GetByIdAsync(id) ?? throw new NotFoundException($"Category with id {id} was not found");
            if (categoryFromDb.IsPredefined)
            {
                throw new BadRequestException("Cannot delete predefined categories!");
            }
            if (user.Id != categoryFromDb.UserId)
            {
                throw new UnauthorizedException("User does not have permission to view this content!");
            }
            await categoryRepository.DeleteAsync(categoryFromDb);

            return mapper.Map<CategoryReadDto>(categoryFromDb);
        }
    }
}
