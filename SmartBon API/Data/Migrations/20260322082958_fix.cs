using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Data.Migrations
{
    /// <inheritdoc />
    public partial class fix : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ReceiveMonthlyBudgetEmail",
                table: "Users",
                newName: "ReceiveMonthlyReportEmail");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ReceiveMonthlyReportEmail",
                table: "Users",
                newName: "ReceiveMonthlyBudgetEmail");
        }
    }
}
