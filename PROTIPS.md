# n-webpack
To improve behaviour when bower linking add the component your linking's name to the `includes` option
- - -
Assign your bundle's output to a global variable by passing in something like the following in the `output` option
```
{
	filename: '[name]',
	library: 'myVariableName'
}
```
- - -
Add `outputStats: 'myStatsFile.json'` to your options to generate information about your bundle(s). This can then be analysed at http://webpack.github.io/analyse/
