include n.Makefile

test: verify test-unit

test-unit:
	mocha
