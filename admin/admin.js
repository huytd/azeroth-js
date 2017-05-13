let app = angular.module('adminApp', []);

app.controller('admin', function($scope, $http) {
  $scope.publishedPosts = [];
  $scope.unpublishedPosts = [];

  $scope.refresh = () => {
    $http.get('/published').success((data) => {
      $scope.publishYears = Array.from(data.years);
      $scope.publishedPosts = Array.from(data.published);
    });

    $http.get('/unpublished').success((data) => {
      $scope.unpublishedPosts = Array.from(data.unpublished);
    });
  }

  $scope.refresh();

  $scope.publishPost = (post, index) => {
    $scope.unpublishedPosts.splice(index, 1);
    $scope.publishedPosts.push(post);
    $scope.updateAll();
  }

  $scope.findPostIndex = (post) => {
    return $scope.publishedPosts.findIndex((item) => {
      return (item.title === post.title && item.year === post.year);
    });
  }

  $scope.unpublishPost = (post) => {
    var delIndex = $scope.findPostIndex(post);
    if (delIndex != -1) {
      $scope.publishedPosts.splice(delIndex, 1);
      $scope.unpublishedPosts.push(post);
      $scope.updateAll();
    }
  }

  $scope.updateAll = () => {
    console.log('Update: ', $scope.publishedPosts);
    $http.post('/update', { data: $scope.publishedPosts })
      .success(function(data) {
      });
  }

  $scope.swap = (a, b) => {
    let temp = $scope.publishedPosts[a];
    $scope.publishedPosts[a] = $scope.publishedPosts[b];
    $scope.publishedPosts[b] = temp;
  }

  $scope.moveUp = (post) => {
    let idx = $scope.findPostIndex(post);
    $scope.swap(idx, idx-1);
    $scope.updateAll();
  }

  $scope.moveDown = (post) => {
    let idx = $scope.findPostIndex(post);
    $scope.swap(idx, idx+1);
    $scope.updateAll();
  }
});
