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
