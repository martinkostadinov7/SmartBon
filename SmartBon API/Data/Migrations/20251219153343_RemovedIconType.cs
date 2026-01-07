using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Data.Migrations
{
    /// <inheritdoc />
    public partial class RemovedIconType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IconType",
                table: "Subcategories");

            migrationBuilder.DropColumn(
                name: "IconType",
                table: "Categories");

            migrationBuilder.RenameColumn(
                name: "IconValue",
                table: "Subcategories",
                newName: "Icon");

            migrationBuilder.RenameColumn(
                name: "IconValue",
                table: "Categories",
                newName: "Icon");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Icon",
                table: "Subcategories",
                newName: "IconValue");

            migrationBuilder.RenameColumn(
                name: "Icon",
                table: "Categories",
                newName: "IconValue");

            migrationBuilder.AddColumn<int>(
                name: "IconType",
                table: "Subcategories",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "IconType",
                table: "Categories",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}
