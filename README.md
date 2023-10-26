# tangro/actions-audit

A @tangro action to run `npm audit --json`. It also adds a status for the audit. The action fails when the app has `critical` or `high` vulnerabilities.

# Version

You can use a specific `version` of this action. The latest published version is `v2.0.18`. You can also use `latest` to always get the latest version.

# Parameters:

| Name             | Type              | Default    | Description                                                                               |
| ---------------- | ----------------- | ---------- | ----------------------------------------------------------------------------------------- |
| post-comment     | boolean(optional) | false      | Set to true to post a comment after the audit result has been collected.                  |
| workingDirectory | string(optional)  | ''         | Set the working directory                                                                 |
| actionName       | string(optional)  | 'audit'    | Set different action name. This is needed if the action is used more than ones in a repo. |
| production       | boolean(optional) | false      | Set to true to not run on devDependencies.                                                |
| auditLevel       | string(optional)  | 'moderate' | Set to change audit level. (allowed strings low, moderate, high, critical )               |

# Example

```yml
audit:
  runs-on: ubuntu-latest
  steps:
    - name: Checkout latest code
      uses: actions/checkout@v4
    - name: Use Node.js 16.x
      uses: actions/setup-node@v4.0.0
      with:
        node-version: 16.x
    - name: Run npm install
      run: npm install
    - name: Run audit
      uses: tangro/actions-audit@v2.0.18
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
  uses: tangro/actions-audit@v2.0.18
  with:
    post-comment: true
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    GITHUB_CONTEXT: ${{ toJson(github) }}
```

# Using with a static file server

You can also publish the test results to a static file server. The action will write the results into `${actionName}/index.html`. The `${actionName}` can be set via a parameter. Otherwise `"audit"` will be used as the folder.

You can publish the results with our custom [deploy actions](https://github.com/tangro/actions-deploy)

```yml
audit:
  runs-on: ubuntu-latest
  steps:
    - name: Checkout latest code
      uses: actions/checkout@v4
    - name: Use Node.js 16.x
      uses: actions/setup-node@v4.0.0
      with:
        node-version: 16.x
    - name: Run npm install
      run: npm install
    - name: Run audit
      uses: tangro/actions-audit@v2.0.18
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        GITHUB_CONTEXT: ${{ toJson(github) }}
    - name: Zip license check result
      if: always()
      run: |
        cd audit
        zip --quiet --recurse-paths ../audit.zip *
    - name: Deploy audit result
      if: always()
      uses: tangro/actions-deploy@v1.2.16
      with:
        context: auto
        zip-file: audit.zip
        deploy-url: ${{secrets.DEPLOY_URL}}
        project: audit
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        GITHUB_CONTEXT: ${{ toJson(github) }}
        DEPLOY_PASSWORD: ${{ secrets.DEPLOY_PASSWORD }}
        DEPLOY_USER: ${{ secrets.DEPLOY_USER }}
```

> **Attention** Do not forget to use the correct `DEPLOY_URL` and provide all the tokens the actions need.

# Development

Follow the guide of the [tangro-actions-template](https://github.com/tangro/tangro-actions-template)

# Scripts

- `npm run update-readme` - Run this script to update the README with the latest versions.

  > You do not have to run this script, since it is run automatically by the release action

- `npm run update-dependencies` - Run this script to update all the dependencies
