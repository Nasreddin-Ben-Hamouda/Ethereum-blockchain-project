App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  // Declaration of accounts whose have permission to add candidate
  firstAccount :"0xC6cA91c978B4CD4D36f4c9459067308018AF6c98",
  secondAccount :"0x13ed21073818c9C52bf156DeE16aCE29eAb9f5df",
  init: function() {
     return App.initWeb3();
  },
  initWeb3: function() {
      if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
      } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
      }
      return App.initContract();
  },
  initContract: function() {
      $.getJSON("Election.json", function(election) {
          // Instantiate a new truffle contract from the artifact
          App.contracts.Election = TruffleContract(election);
          // Connect provider to interact with contract
          App.contracts.Election.setProvider(App.web3Provider);
      return App.render();
      });
  },


  render: function() {
      var electionInstance;
      var loader = $("#loader");
      var content = $("#content");
      loader.show();
      content.hide();
      // Load account data
      web3.eth.getCoinbase(function(err, account) {
      //web3.eth.getAccounts(function(err,accounts){
          if (err === null) {
            console.log(account);
          App.account = account;
          $("#accountAddress").html("Your Account: " + account);
          }
      });
      // Load contract data
      App.contracts.Election.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance.candidatesCount();
      }).then(function(candidatesCount) {
      var candidatesResults = $("#candidatesResults");
      candidatesResults.empty();
      var candidatesSelect = $('#candidatesSelect');
      candidatesSelect.empty();
      for (var i = 1; i <= candidatesCount; i++) {
      electionInstance.candidates(i).then(function(candidate) {
      var id = candidate[0];
      var name = candidate[1];
      var voteCount = candidate[2];
      // Render candidate Result
      var candidateTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
      candidatesResults.append(candidateTemplate);
      // Render candidate ballot option
      var candidateOption = "<option value='" + id + "' >" + name + "</option>"
      candidatesSelect.append(candidateOption);
      });
      }
      return electionInstance.voters(App.account);
      }).then(function(hasVoted) {
      // Do not allow a user to vote
      if(hasVoted) {
        $('#formVote').hide();
      }

      //hide add candidate form for all accounts available in ganache except accounts 1 and 2
      if(App.account!==App.firstAccount.toLowerCase() && App.account!==App.secondAccount.toLowerCase()){
          $("#formAddCandidate").hide();
      }
      loader.hide();
      content.show();
      }).catch(function(error) {
      console.warn(error);
      });
    },
    addCandidate: function(){
        // Do not allow all accounts to add new candidate except account 1 and 2
        if(App.account===App.firstAccount.toLowerCase() || App.account===App.secondAccount.toLowerCase()){
          var candidateName = $('#candidateName').val();
          App.contracts.Election.deployed().then(function(instance)
              {
                return instance.addCandidate(candidateName, { from: App.account });
              }
          ).then(function(result) {
          // Wait for votes to update
          $("#content").hide();
          $("#loader").show();
          }).catch(function(err) {
          console.error(err);
          });
        }
    }
    ,
    castVote: function() {
      var candidateId = $('#candidatesSelect').val();
      App.contracts.Election.deployed().then(function(instance)
      {
        
      return instance.vote(candidateId, { from: App.account })
      ;
      }).then(function(result) {
      // Wait for votes to update
      $("#content").hide();
      $("#loader").show();
      }).catch(function(err) {
      console.error(err);
      });
      }
      };
       
  
$(function(){
  $(window).load(function(){
    App.init();
  });
});
