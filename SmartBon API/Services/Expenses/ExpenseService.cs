using AutoMapper;
using Data.Interfaces;
using Data.Models;
using Microsoft.AspNetCore.Http;
using Services.Interfaces;
using Shared.ApiExceptions;
using Shared.DTOs.Expenses;
using Shared.DTOs.Expenses.Ranges;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace Services.Expenses
{
    public class ExpenseService(IUserAccessor user, IExpenseRepository expenseRepository, IMapper mapper, IBudgetRepository budgetRepository) : IExpenseService
    {
        public async Task<ExpenseReadDto> CreateExpenseAsync(ExpenseCreateDto dto)
        {
            Expense expense = mapper.Map<Expense>(dto);
            expense.CreatedAt = DateTime.Now;
            expense.UserId = user.Id;
            await expenseRepository.AddAsync(expense);
            
            List<Budget> budgets = await budgetRepository.GetAllAsync(user.Id);
            foreach (var budget in budgets)
            {
                if ((budget.CategoryIds.Contains(expense.CategoryId) || ((expense.SubcategoryId != null) ? budget.SubcategoryIds.Contains(expense.SubcategoryId!.Value) : false)) && 
                    (budget.From <= expense.ExpenseDate && budget.To >= expense.ExpenseDate))
                {
                    budget.CurrentAmount += expense.Cost;
                    await budgetRepository.UpdateAsync(budget);
                }
            }
            return mapper.Map<ExpenseReadDto>(expense);
        }

        public async Task<List<ExpenseReadDto>> GetExpensesAsync()
        {
            List<Expense> expensesFromDb = await expenseRepository.GetAllAsync(user.Id);

            return mapper.Map<List<ExpenseReadDto>>(expensesFromDb);
        }

        public async Task<ExpenseReadDto> GetExpenseByIdAsync(int id)
        {
            Expense expenseFromDb = await expenseRepository.GetByIdAsync(id) ?? throw new NotFoundException($"Expense with id {id} was not found");  
            if (expenseFromDb.UserId != user.Id)
            {
                throw new UnauthorizedException("User has no access to this content!");
            }
            return mapper.Map<ExpenseReadDto>(expenseFromDb);
        }


        public async Task<ExpenseReadDto> DeleteExpenseAsync(int id)
        {
            Expense expenseFromDb = await expenseRepository.GetByIdAsync(id) ?? throw new NotFoundException($"Expense with id {id} was not found");

            if (expenseFromDb.UserId != user.Id)
            {
                throw new UnauthorizedException("User has no access to this content!");
            }
            await expenseRepository.DeleteAsync(expenseFromDb);

            List<Budget> budgets = await budgetRepository.GetAllAsync(user.Id);
            foreach (var budget in budgets)
            {
                if ((budget.CategoryIds.Contains(expenseFromDb.CategoryId) || ((expenseFromDb.SubcategoryId != null) ? budget.SubcategoryIds.Contains(expenseFromDb.SubcategoryId!.Value) : false)) &&
                    (budget.From <= expenseFromDb.ExpenseDate && budget.To >= expenseFromDb.ExpenseDate))
                {
                    budget.CurrentAmount -= expenseFromDb.Cost;
                    await budgetRepository.UpdateAsync(budget);
                }
            }

            return mapper.Map<ExpenseReadDto>(expenseFromDb);
        }

        public async Task<ExpenseReadDto> UpdateExpenseAsync(int id, ExpenseUpdateDto dto)
        {
            Expense expenseFromDb = await expenseRepository.GetByIdAsync(id) ?? throw new NotFoundException($"Expense with id {id} was not found");

            if (expenseFromDb.UserId != user.Id)
            {
                throw new UnauthorizedException("User has no access to this content!");
            }

            mapper.Map(dto, expenseFromDb);

            await expenseRepository.UpdateAsync(expenseFromDb);

            List<Budget> budgets = await budgetRepository.GetAllAsync(user.Id);
            foreach (var budget in budgets)
            {
                if ((budget.CategoryIds.Contains(expenseFromDb.CategoryId) || ((expenseFromDb.SubcategoryId != null) ? budget.SubcategoryIds.Contains(expenseFromDb.SubcategoryId!.Value) : false)) &&
                    (budget.From <= expenseFromDb.ExpenseDate && budget.To >= expenseFromDb.ExpenseDate))
                {
                    budget.CurrentAmount += expenseFromDb.Cost;
                    await budgetRepository.UpdateAsync(budget);
                }
            }

            return mapper.Map<ExpenseReadDto>(expenseFromDb);
        }

        public async Task<List<ExpenseReadDto>> GetRecentExpensesAsync(int count)
        {
            List<Expense> expensesFromDb = await expenseRepository.GetRecentExpensesAsync(user.Id, count);

            return mapper.Map<List<ExpenseReadDto>>(expensesFromDb);
        }

        public async Task<List<ExpenseReadDto>> GetExpensesWithQueryParamsAsync(ExpenseQueryParams queryParams)
        {
            if(queryParams?.FilterParams?.StartDate > queryParams?.FilterParams?.EndDate)
            {
                throw new BadRequestException("'startDate' cannot be after 'endDate'.");
            }

            if (queryParams?.FilterParams?.FromCost > queryParams?.FilterParams?.ToCost)
            {
                throw new BadRequestException("'fromCost' cannot be larger than 'toCost'.");
            }

            List<Expense> expensesFromDb = await expenseRepository.GetExpensesFromQueryAsync(user.Id, queryParams!);

            return mapper.Map<List<ExpenseReadDto>>(expensesFromDb);
        }

        public async Task<CostRangeDto> GetCostRangeAsync()
        {
            return await expenseRepository.GetCostRangeAsync(user.Id);
        }

        public async Task<DateRangeDto> GetDateRangeAsync()
        {
            return await expenseRepository.GetDateRangeAsync(user.Id);
        }

        public async Task<ExpenseFilledFromImageDto> ExtractExpenseDataAsync(IFormFile image)
        {
            using var client = new HttpClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", "ТВОЯТ_API_КЛЮЧ");

            // 1. Превръщаме снимката в Base64 стринг
            using var ms = new MemoryStream();
            await image.CopyToAsync(ms);
            byte[] imageBytes = ms.ToArray();
            string base64Image = Convert.ToBase64String(imageBytes);

            // 2. Дефинираме промпта
            string systemPrompt = "You are a receipt scanner. Extract data into JSON: { \"merchant\": string, \"totalAmount\": number, \"date\": string }. Return ONLY raw JSON.";

            // 3. Изграждаме JSON тялото на заявката
            var requestBody = new
            {
                model = "gpt-4o-mini",
                messages = new object[] // <--- Трябва да е new object[]
                {
                    new
                    {
                        role = "system",
                        content = systemPrompt
                    },
                    new
                    {
                        role = "user",
                        content = new object[]
                        {
                            new { type = "text", text = "Please extract the data from this receipt." },
                            new { type = "image_url", image_url = new { url = $"data:{image.ContentType};base64,{base64Image}" } }
                        }
                    }
                },
                response_format = new { type = "json_object" },
                max_tokens = 300
            };

            // 4. Изпращаме заявката
            var response = await client.PostAsJsonAsync("https://api.openai.com/v1/chat/completions", requestBody);

            if (response.IsSuccessStatusCode)
            {
                var jsonResponse = await response.Content.ReadFromJsonAsync<JsonElement>();

                // OpenAI връща данните в специфична структура: choices[0].message.content
                string content = jsonResponse.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString();

                // 5. Десериализираме чистия JSON в твоя обект
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return JsonSerializer.Deserialize<ExpenseFilledFromImageDto>(content, options);
            }

            throw new Exception($"OpenAI API Error: {response.ReasonPhrase}");
        }
    }
}
