using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using Shared.DTOs.Categories;

namespace SmartBon_API.Controllers
{
    [Authorize]
    [Route("/api/[controller]")]
    [ApiController]
    public class CategoriesController(ICategoryService categoryService, ISubcategoryService subcategoryService) : ControllerBase
    {
        [HttpPost]
        public async Task<ActionResult<string>> CreateCategory(CategoryCreateDto request)
        {
            CategoryReadDto result = await categoryService.CreateCategoryAsync(request);
            return CreatedAtAction(nameof(GetCategoryById), new { id = result.Id }, result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<string>> GetCategoryById(int id)
        {
            CategoryReadDto result = await categoryService.GetCategoryByIdAsync(id);
            return Ok(result);
        }

        [HttpGet]
        public async Task<ActionResult<string>> GetCategories() // todo imeplemtn parameters for filtering and searching
        {
            List<CategoryReadDto> result = await categoryService.GetCategoriesAsync();
            return Ok(result);
        }
        
        [HttpDelete("{id}")]
        public async Task<ActionResult<string>> DeleteCategory(int id)
        {
            CategoryReadDto result = await categoryService.DeleteCategoryAsync(id);
            return Ok(result);
        }

        [HttpPost("{categoryId}/subcategories")]
        public async Task<ActionResult<string>> CreateSubcategory(int categoryId, SubcategoryCreateDto request)
        {
            await subcategoryService.CreateSubcategoryAsync(categoryId, request);
            return Created();
        }

        [HttpGet("{categoryId}/subcategories/{id}")]
        public async Task<ActionResult<string>> GetSubcategoryById(int categoryId, int id)
        {
            SubcategoryReadDto result = await subcategoryService.GetSubcategoryByIdAsync(categoryId, id);
            return Ok(result);
        }

        [HttpGet("{categoryId}/subcategories")]
        public async Task<ActionResult<string>> GetSubcategories(int categoryId) // todo imeplemtn parameters for filtering and searching
        {
            List<SubcategoryReadDto> result = await subcategoryService.GetSubcategoriesAsync(categoryId);
            return Ok(result);
        }
        
        [HttpDelete("{categoryId}/subcategories/{id}")]
        public async Task<ActionResult<string>> DeleteSubcategory(int id)
        {
            SubcategoryReadDto result = await subcategoryService.DeleteSubcategoryAsync(id);
            return Ok(result);
        }

    }
}
