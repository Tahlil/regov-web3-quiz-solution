# WeIDY: Web3 Identity solution
### Run local indy ledger with Von network
#### Assumptions
- Mac with M1 chip
- Homebrew installed
- Docker installed and running

#### Run Von Network
- Install `gnu-sed` with Homebrew:
```
brew install gnu-sed
```
- Go to von network directory.
```
cd LocalIndyInstance/von-network
```
- Run the following commands to run indy network locally:
```
./manage build
./manage start
```
- Run the following commands to get live logs:
```
./manage logs
```