using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using Shared.DTOs.Categories;

namespace SmartBon_API.Controllers
{
    /// <summary>
    /// API endpoints for managing expense categories and nested subcategories.
    /// </summary>
    [Authorize]
    [Route("/api/[controller]")]
    [ApiController]
    public class CategoriesController(ICategoryService categoryService, ISubcategoryService subcategoryService) : ControllerBase
    {
        /// <summary> Creates a new custom main category. </summary>
        [HttpPost]
        public async Task<ActionResult<CategoryReadDto>> CreateCategory(CategoryCreateDto request)
        {
            CategoryReadDto result = await categoryService.CreateCategoryAsync(request);
            return CreatedAtAction(nameof(GetCategoryById), new { id = result.Id }, result);
        }

        /// <summary> Retrieves a specific category by its ID. </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<CategoryReadDto>> GetCategoryById(int id)
        {
            CategoryReadDto result = await categoryService.GetCategoryByIdAsync(id);
            return Ok(result);
        }

        /// <summary> Retrieves all available categories for the user. </summary>
        [HttpGet]
        public async Task<ActionResult<List<CategoryReadDto>>> GetCategories()
        {
            List<CategoryReadDto> result = await categoryService.GetCategoriesAsync();
            return Ok(result);
        }

        /// <summary> Deletes a specific custom category. </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult<CategoryReadDto>> DeleteCategory(int id)
        {
            CategoryReadDto result = await categoryService.DeleteCategoryAsync(id);
            return Ok(result);
        }

        /// <summary> Creates a new subcategory linked to a specific main category. </summary>
        [HttpPost("{categoryId}/subcategories")]
        public async Task<ActionResult> CreateSubcategory(int categoryId, SubcategoryCreateDto request)
        {
            await subcategoryService.CreateSubcategoryAsync(categoryId, request);
            return Created();
        }

        /// <summary> Retrieves a specific subcategory belonging to a parent category. </summary>
        [HttpGet("{categoryId}/subcategories/{id}")]
        public async Task<ActionResult<SubcategoryReadDto>> GetSubcategoryById(int categoryId, int id)
        {
            SubcategoryReadDto result = await subcategoryService.GetSubcategoryByIdAsync(categoryId, id);
            return Ok(result);
        }

        /// <summary> Retrieves all subcategories for a specific parent category. </summary>
        [HttpGet("{categoryId}/subcategories")]
        public async Task<ActionResult<List<SubcategoryReadDto>>> GetSubcategories(int categoryId)
        {
            List<SubcategoryReadDto> result = await subcategoryService.GetSubcategoriesAsync(categoryId);
            return Ok(result);
        }

        /// <summary> Deletes a specific subcategory. </summary>
        [HttpDelete("{categoryId}/subcategories/{id}")]
        public async Task<ActionResult<SubcategoryReadDto>> DeleteSubcategory(int id)
        {
            SubcategoryReadDto result = await subcategoryService.DeleteSubcategoryAsync(id);
            return Ok(result);
        }
    }
}