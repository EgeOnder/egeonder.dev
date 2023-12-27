# How to contribute

### ❗ **Common mistakes**

- Please do not try to contribute with formatting the code purely for aesthetic reasons since this won't have an effect on the product's functionality, most likely PRs like this will not be accepted.
- Opening a pull request without a description or a proper name is not fun for the reviewer, so try to explain your change as much as possible either by text or a code snippet.
- Not linting your code using the configuration given by the project would result in a change request. Please be aware that your code is not wrong, it is just **wrongly linted**.
- This codespace uses `pnpm`, so please try to respect the choice and try to use it.

### 📝 Useful scripts

| Command         | Description                              |
| --------------- | ---------------------------------------- |
| `pnpm build`    | Builds the project for production        |
| `pnpm build`    | Starts the project for production        |
| `pnpm dev`      | Starts the project in development mode   |
| `pnpm lint`     | Lints the project using ESLint           |
| `pnpm generate` | Generates the `drizzle` migrations       |
| `pnpm up`       | Updates the DB with generated migrations |

### 🐛 **Did you find a bug?**

Ensure the bug was not already reported by searching on GitHub under [Issues](https://github.com/EgeOnder/egeonder.dev/issues). If you're unable to find an open issue addressing the problem, [open a new one](https://github.com/EgeOnder/egeonder.dev/issues). Be sure to include a **title and clear description**, as much relevant information as possible demonstrating the expected behavior that is not occurring.

### 💡 **Do you want to add a new feature or change an existing one?**

[Open a GitHub issue](https://github.com/EgeOnder/egeonder.dev/issues) stating your feature request clearly. We can discuss it on the issue thread, then you can implement it! 🎉

### ✨ **Did you write a change that fixes a bug?**

Open a new GitHub pull request with the patch.

1. Fork the repository
2. Modify the code and make your amazing change
3. Create your branch
   ```sh
   git checkout -b fix/<your_fix>
   ```
4. Add your changes
   ```sh
   git add .
   ```
5. Commit your changes _(please respect the commit message standards)_
   ```sh
   git commit -m "fix: fixed everything!"
   ```
6. Push your changes
   ```sh
   git push -u origin fix/<your_fix>
   ```
7. Open a pull request from your branch
   - State your change in the title according to the [conventional commit guidelines](https://www.conventionalcommits.org/en/v1.0.0/).
   - Please respect the pull request template while writing your PR description.

Open source software is beautiful, all of your contributions are much appreciated

Thanks!
