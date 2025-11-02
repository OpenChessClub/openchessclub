function getKFactor(playerRating, gamesPlayed) {
  if (gamesPlayed < 30) return 40;
  if (playerRating >= 2400) return 10;
  return 20;
}

function calculateEloChange(playerRating, opponentRating, score, gamesPlayed) {
  const kFactor = getKFactor(playerRating, gamesPlayed);
  const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
  const ratingChange = Math.round(kFactor * (score - expectedScore));
  return ratingChange;
}

function calculateGameRatings(whiteRating, blackRating, result) {
  let whiteScore, blackScore;

  switch (result) {
    case 'white_win':
      whiteScore = 1;
      blackScore = 0;
      break;
    case 'black_win':
      whiteScore = 0;
      blackScore = 1;
      break;
    case 'draw':
      whiteScore = 0.5;
      blackScore = 0.5;
      break;
    default:
      throw new Error('Invalid game result');
  }

  const whiteChange = calculateEloChange(whiteRating, blackRating, whiteScore);
  const blackChange = calculateEloChange(blackRating, whiteRating, blackScore);

  return {
    whiteRatingAfter: whiteRating + whiteChange,
    blackRatingAfter: blackRating + blackChange,
    whiteRatingChange: whiteChange,
    blackRatingChange: blackChange
  };
}

module.exports = { calculateGameRatings };
