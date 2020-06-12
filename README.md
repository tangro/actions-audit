# actions-audit

A @tangro action to run `npm audit --json`. It also adds a status for the audit. The action fails when the app has `critical` or `high` vulnerabilities.

# Version

You can use a specific `version` of this action. You can also use `latest` to always get the latest version.

Parameters:
| Name | Type | Default | Description |
|--|--|--|--|
|post-comment | boolean(optional) | false | Set to true to post a comment after the audit result has been collected.|
|workingDirectory | string(optional) | '' | Set the working directory |
|actionName | string(optional) | 'audit' | Set different action name. This is needet if the action is uset more than ones in a repo.|

# Example

```yml
audit:
  runs-on: ubuntu-latest
  steps:
    - name: Checkout latest code
      uses: actions/checkout@v1
    - name: Use Node.js 12.x
      uses: actions/setup-node@v1
      with:
        node-version: 12.x
    - name: Run npm install
      run: npm install
    - name: Run audit
      uses: tangro/actions-audit@1.1.0
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        GITHUB_CONTEXT: ${{ toJson(github) }}
```

> **Attention** Do not forget to pass `GITHUB_TOKEN` and the `GITHUB_CONTEXT`

Steps this example job will perform:

1. Check out the latest code
2. Use node
3. Run `npm install`
4. (this action) Run the audit action

# Usage

This action will run `npm audit --json` and check the results. The workflow run will fail when there are `high` or `critical` vulnerabilities. Others will be allowed.

The action will set a status to the commit to `pending` under the context `Tangro CI/audit` (or if actionName ist set under `Tangro CI/actionName`). When it finishes successfully it will change the status to `success` and the audit result will be displayed in the description. If it fails the action will set the status to `failed`.

It is also possible that the action posts a comment with the result to the commit. You have to set `post-comment` to `true`.

```yml
- name: Run audit
  uses: tangro/actions-audit@1.1.0
  with:
    post-comment: true
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    GITHUB_CONTEXT: ${{ toJson(github) }}
```

# Development

Follow the guide of the [tangro-actions-template](https://github.com/tangro/tangro-actions-template)
