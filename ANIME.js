function findClosestResult(searchString, results) {
    const modifiedSearchString = searchString.replace(/\s+/g, '-'); // Replace spaces with hyphens
  
    // Filter results based on titles containing the modified search string
    const filteredResults = results.filter(result =>
      result.title.toLowerCase().includes(modifiedSearchString.toLowerCase())
    );
  
    if (filteredResults.length > 0) {
      // If there are matching results, perform Levenshtein distance calculation
      const distances = filteredResults.map((result, index) => {
        const distance = levenshteinDistance(modifiedSearchString.toLowerCase(), result.title.toLowerCase());
        return { index, distance };
      });
  
      distances.sort((a, b) => a.distance - b.distance);
  
      const closestResultIndex = distances[0].index;
      console.log(filteredResults[closestResultIndex]);
      return filteredResults[closestResultIndex];
    } else {
      // If no matching results, perform Levenshtein distance calculation directly
      const distances = results.map((result, index) => {
        const distance = levenshteinDistance(modifiedSearchString.toLowerCase(), result.title.toLowerCase());
        return { index, distance };
      });
  
      distances.sort((a, b) => a.distance - b.distance);
  
      const closestResultIndex = distances[0].index;
      console.log(results[closestResultIndex]);
      return results[closestResultIndex];
    }
  }  
  

function levenshteinDistance(a, b) {
    const dp = Array.from(Array(a.length + 1), () => Array(b.length + 1).fill(0));
  
    for (let i = 0; i <= a.length; i++) {
      dp[i][0] = i;
    }
  
    for (let j = 0; j <= b.length; j++) {
      dp[0][j] = j;
    }
  
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        if (a[i - 1] === b[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = Math.min(
            dp[i - 1][j - 1] + 1,
            dp[i][j - 1] + 1,
            dp[i - 1][j] + 1
          );
        }
      }
    }
  
    return dp[a.length][b.length];
  }

function playVideoOnTopLayer(videoURI, subtitleContent) {
  const videoUrl = 'https://farflunghotpinkpetabyte.westvirgin.repl.co/cors?url=' + videoURI;

  var div = document.createElement('div');
  div.style.position = 'fixed';
  div.style.top = '0';
  div.style.left = '0';
  div.style.width = '100%';
  div.style.height = '100%';
  div.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  div.style.zIndex = '9997';

  var video = document.createElement('video');
  video.style.width = '100%';
  video.style.height = '100%';
  video.controls = true;

  var track = document.createElement('track');
  track.kind = "subtitles";
  track.label = "English";
  track.srclang = "en";
  track.default = true;

  if (subtitleContent) {
    var blob = new Blob([subtitleContent], { type: 'text/vtt' });
    track.src = URL.createObjectURL(blob);
  }

  if (Hls.isSupported()) {
    var hls = new Hls();
    hls.loadSource(videoUrl);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      video.play();
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = videoUrl;
    video.addEventListener('canplay', function () {
      video.play();
    });
  }

  video.appendChild(track);
  div.appendChild(video);
  document.body.appendChild(div);
}

function convertToVtt(currentURI, callback) {
    const currentURL = `` + currentURI;

    var xhr = new XMLHttpRequest();
  
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        var fileContent = xhr.responseText;
        var vttContent = "WEBVTT\n\n" + fileContent;
        callback(vttContent);
      }
    };
  
    xhr.open('GET', currentURL);
    xhr.send();
  }

function getStreaming(data, currentURL) {
    if (data.sources && data.sources.length > 0 && data.subtitles && data.subtitles.length > 0) {
      const stream = data.sources[0];
      const streamURL = stream.url;

      const subtitles = data.subtitles[0];
      const subtitleStream = subtitles.url;

      console.log(streamURL);
      convertToVtt(subtitleStream, function (convertedContent) {
        console.log(convertedContent);
        playVideoOnTopLayer(streamURL, convertedContent);
      });
    }
    else if (data.sources && data.sources.length) {
      const stream = data.sources[0];
      const streamURL = stream.url;

      playVideoOnTopLayer(streamURL);
    }
  }
  
  function fetchAnimeJSONFromStream(id) {
    var apiUrL = `https://api.consumet.org/anime/zoro/watch?episodeId=` + id;
  
    fetch(apiUrL)
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Network response was not OK');
        }
        return response.json();
      })
      .then(function (data) {
        console.log(data);
        const currentURL = 'https://cc.zorores.com/a9/57/a957710cb78bcbbbf6c7850bd92a039c/a957710cb78bcbbbf6c7850bd92a039c.vtt';
        getStreaming(data, currentURL);
      })
      .catch(function (error) {
        console.error('Error:', error);
      });
  }

function getAnimeEpisodeID(data) {
  const episodePrompt = prompt("Episode?");
  const dubOrSub = prompt("A. Sub, B. Dub", 'A');

  if (data.episodes && data.episodes.length > 0) {
    const episode = data.episodes[episodePrompt - 1];
    const episodeID = episode.id;
    const episodeDubID = episodeID.replace(/sub/gi, 'dub');
    if (dubOrSub === 'B') {
      console.log(episodeDubID);
      fetchAnimeJSONFromStream(episodeDubID);
    } else if (dubOrSub === 'A') {
      console.log(episodeID);
      fetchAnimeJSONFromStream(episodeID);
    } else {
      alert("Please put A for sub, and B for dub");
    }
  }
}

function fetchJsonFromAnimeID(id) {
  var apiURL = `https://api.consumet.org/anime/zoro/info?id=` + id;

  fetch(apiURL)
    .then(function (response) {
      if (!response.ok) {
        throw new Error('Network response was not OK');
      }
      return response.json();
    })
    .then(function (data) {
      console.log(data);
      getAnimeEpisodeID(data);
    })
    .catch(function (error) {
      console.error('Error:', error);
    });
}

function getAnimeID(data, anime) {
  if (data.results && data.results.length > 0) {
    const firstResult = findClosestResult(anime, data.results);
    const firstResultID = firstResult.id;
    console.log(firstResultID);
    fetchJsonFromAnimeID(firstResultID);
  }
}

function animeFetchJSONFromAPI() {
    const anime = prompt("Insert The Anime Name");
    var apiUrl = `https://api.consumet.org/anime/zoro/` + anime + `?page=1`;

  fetch(apiUrl)
    .then(function (response) {
      if (!response.ok) {
        throw new Error('Network response was not OK');
      }
      return response.json();
    })
    .then(function (data) {
      console.log(data);
      getAnimeID(data, anime);
    })
    .catch(function (error) {
      console.error('Error:', error);
    });
}

createSleekMenu();
