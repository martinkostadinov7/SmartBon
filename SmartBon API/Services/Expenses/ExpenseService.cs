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
using OpenAI; // Base namespace
using OpenAI.Chat;
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

            List<string> budgetNamesAlmost = new List<string>();
            List<string> budgetNamesReached = new List<string>();
            List<Budget> budgets = await budgetRepository.GetAllAsync(user.Id);
            foreach (var budget in budgets)
            {
                if ((budget.CategoryIds.Contains(expense.CategoryId) || ((expense.SubcategoryId != null) ? budget.SubcategoryIds.Contains(expense.SubcategoryId!.Value) : false)) && 
                    (budget.From <= expense.ExpenseDate && budget.To >= expense.ExpenseDate))
                {
                    budget.CurrentAmount += expense.Cost;
                    await budgetRepository.UpdateAsync(budget);
                }

                if (budget.CurrentAmount >= budget.Limit)
                {
                    budgetNamesReached.Add(budget.Name);
                }
                else if (budget.CurrentAmount >= budget.Limit * 0.8m && budget.CurrentAmount < budget.Limit)
                {
                    budgetNamesAlmost.Add(budget.Name);
                }
            }
            if (budgetNamesReached.Any())
            {
                throw new BadRequestException($"Budget limit for {string.Join(", ", budgetNamesReached)} reached!");
            }
            if (budgetNamesAlmost.Any())
            {
                throw new BadRequestException($"Budget limit for {string.Join(", ", budgetNamesAlmost)} almost reached!");
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
            decimal previousCost = expenseFromDb.Cost;
            mapper.Map(dto, expenseFromDb);

            await expenseRepository.UpdateAsync(expenseFromDb);

            List<Budget> budgets = await budgetRepository.GetAllAsync(user.Id);
            foreach (var budget in budgets)
            {
                if ((budget.CategoryIds.Contains(expenseFromDb.CategoryId) || ((expenseFromDb.SubcategoryId != null) ? budget.SubcategoryIds.Contains(expenseFromDb.SubcategoryId!.Value) : false)) &&
                    (budget.From <= expenseFromDb.ExpenseDate && budget.To >= expenseFromDb.ExpenseDate))
                {
                    budget.CurrentAmount -= previousCost;
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
            OpenAIClient client = new("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");

            ChatClient chatClient = client.GetChatClient("gpt-4o");

            if (image == null || image.Length == 0)
                throw new BadRequestException("No file uploaded.");

            // 1. Process the stream to BinaryData
            using var stream = new MemoryStream();
            await image.CopyToAsync(stream);
            var imageData = BinaryData.FromBytes(stream.ToArray(), image.ContentType);
            ChatCompletionOptions options = new()
            {
                ResponseFormat = ChatResponseFormat.CreateJsonObjectFormat(),
                Temperature = 0.0f // Keep it consistent for data extraction
            };
            // 2. Create the message using the static factory method CreateImagePart
            List<ChatMessage> messages = new()
            {
                new SystemChatMessage(@"
            You are a professional receipt analyzer for Bulgarian receipts. 
            The input images will be in Bulgarian (Cyrillic).
    
            RULES FOR 'Title':
            1. Look for the merchant name at the top (e.g., 'Kaufland', 'Fantastico').
            2. If no merchant name is visible, categorize the receipt based on the items 
                (e.g., 'Groceries', 'Gas Station', 'Restaurant').
            3. Keep the title short (maximum 3-4 words).

            Return a strictly valid JSON object with:
            - 'Title': Short merchant name (e.g., 'Billa', 'Lidl', 'Shell').
            - 'Cost': The numerical total amount.
            - 'Description': A SINGLE STRING containing all products. 
                Format: '{productName} {productPrice}'. 
                Every product MUST be on a new line within the string.
            - 'ExpenseDate': The date in YYYY-MM-DD format.
    
            If the receipt is blurry or data is missing, use null."),
                new UserChatMessage(
                    ChatMessageContentPart.CreateImagePart(imageData, "image/jpeg"),
                    ChatMessageContentPart.CreateTextPart("Extract the data from this receipt.")
                )
            };

            // 3. Send to the model
            ChatCompletion completion = await chatClient.CompleteChatAsync(messages, options);
            Console.WriteLine($"[ASSISTANT]: {completion.Content[0].Text}");


            string jsonResponse = completion.Content[0].Text;

            // Use JsonSerializer to map the string to your object
            var jsonOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true // This handles "title" vs "Title" automatically
            };

            ExpenseFilledFromImageDto? mappedExpense = JsonSerializer.Deserialize<ExpenseFilledFromImageDto>(jsonResponse, jsonOptions);
            return mappedExpense;
        }
    }
}
