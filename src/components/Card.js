import React, { useState, useEffect, useRef } from 'react';
import { useSpring, animated, config } from 'react-spring';
import styled from 'styled-components/macro';
import ReactGA from 'react-ga';

import CardHeader from './CardHeader';
import TeamInfo from './TeamInfo';
import GameTime from './GameTime';
import ScoreTable from './ScoreTable';
import Divider from './Divider';
import MatchHighlightsRail from './MatchHighlightsRail';
import PlayerStatsSection from './PlayerStatsSection';

const CardWrapper = styled(animated.div)`
  -webkit-tap-highlight-color: rgba(255, 255, 255, 0);
  user-select: none;
  height: 150px;
  color: white;
  background-color: #1e1e1e;
  border-radius: 10px;
  margin-bottom: 20px;
  width: 330px;
  display: flex;
  flex-direction: column;
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-bottom: 5px;
  margin-top: 0px;
`;

const CardCenter = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Card = ({
  hTeamId,
  vTeamId,
  startTimeUTC,
  hTeamName,
  vTeamName,
  statusNum,
  hTeamScore,
  vTeamScore,
  hTeamRecordFormatted,
  vTeamRecordFormatted,
  hTeamQScore,
  vTeamQScore,
  index,
  selectedIndex,
  onSelect,
  currentPeriod,
  gameClock,
  isHalfTime,
  isEndofPeriod,
  matchStats = [],
  youtubevideos = [],
  showVideoOverlay,
  favoriteTeam,
}) => {
  let [cardOpen, toggleCardOpen] = useState(false);
  let [homeSelected, toggleDivider] = useState(true);
  const onCardClick = () => {
    if (statusNum === 1) return;
    if (!cardOpen) {
      toggleDivider(true);
      ReactGA.event({
        category: 'User',
        action: 'Click match card',
        label: `${hTeamName} - ${vTeamName}`,
      });
    }
    toggleCardOpen(!cardOpen);
    onSelect(index, youtubevideos);
  };

  useEffect(
    () => {
      if (!showVideoOverlay && cardOpen) {
        El.current.scrollIntoView({
          behavior: 'instant',
          block: 'center',
          inline: 'nearest',
        });
      }
    },
    [showVideoOverlay],
  );

  const El = useRef(null);

  useEffect(
    () => {
      if (selectedIndex !== index && cardOpen) {
        toggleCardOpen(!cardOpen);
      }
    },
    [selectedIndex],
  );

  const handleToggleOnClick = event => {
    event.stopPropagation();
    toggleDivider(!homeSelected);
  };

  const sortMatchStats = (matchstats, teamId) => {
    return matchStats.filter(stat => {
      if (stat.player) {
        return stat.player.teamId === teamId;
      } else return null;
    });
  };

  const [cardHeightStyle] = useSpring({
    height: cardOpen ? '600px' : '140px',
    from: { height: '140px' },
    config: config.stiff,
  });

  const [teamNameStyle] = useSpring({
    fontSize: cardOpen ? 15 : 24,
    from: { fontSize: 24 },
    config: config.stiff,
  });

  const [scoreStyle] = useSpring({
    fontSize: cardOpen ? 24 : 36,
    from: { fontSize: 36 },
    config: config.stiff,
  });

  const [scoreTableStyle] = useSpring({
    opacity: cardOpen ? 1 : 0,
    display: cardOpen ? 'inherit' : 'none',
    marginTop: 5,
    from: { opacity: 0, display: 'none' },
    config: config.stiff,
  });

  const formatTime = (
    currentPeriod,
    gameClock,
    statusNum,
    isHalfTime,
    isEndOfPeriod,
  ) => {
    if (statusNum === 3) {
      return 'FINAL';
    } else if (isHalfTime) {
      return 'HALF TIME';
    } else if (isEndOfPeriod) {
      return `END OF Q${currentPeriod}`;
    } else if (statusNum === 1) {
      let gameTimeDate = new Date(parseInt(startTimeUTC));
      let hours = gameTimeDate.getHours();
      let minutes = gameTimeDate.getMinutes();
      return `${hours}:${minutes === 0 ? '00' : minutes}`;
      // sometimes nba api is slow to update a match has finished, leaving statusNum at 2 and gameClock null X_X
    } else if (gameClock === null && statusNum === 2 && currentPeriod === 4) {
      return `FINAL`;
      // when quarter is just beginning, game clock is null
    } else if (gameClock === null && statusNum === 2) {
      return `Q${currentPeriod} 12:00}`;
    } else if (gameClock === null) {
      return `END OF Q${currentPeriod}`;
    } else {
      return `Q${currentPeriod} ${gameClock || '12:00'}`;
    }
  };

  return (
    <CardWrapper style={cardHeightStyle} onClick={onCardClick} ref={El}>
      <CardHeader statusNum={statusNum} cardOpen={cardOpen} />
      <CardContent statusNum={statusNum}>
        <TeamInfo
          home
          homeSelected={homeSelected}
          toggleDivider={handleToggleOnClick}
          cardOpen={cardOpen}
          teamName={hTeamName}
          teamNameStyle={teamNameStyle}
          record={hTeamRecordFormatted}
          scoreStyle={scoreStyle}
          score={hTeamScore}
          favTeam={favoriteTeam}
        />
        <CardCenter cardOpen={cardOpen}>
          <GameTime
            time={formatTime(
              currentPeriod,
              gameClock,
              statusNum,
              isHalfTime,
              isEndofPeriod,
            )}
          />
          <animated.div style={scoreTableStyle}>
            {hTeamQScore &&
              vTeamQScore && (
                <ScoreTable homeScores={hTeamQScore} awayScores={vTeamQScore} />
              )}
          </animated.div>
        </CardCenter>
        <TeamInfo
          home={false}
          homeSelected={homeSelected}
          toggleDivider={handleToggleOnClick}
          cardOpen={cardOpen}
          teamName={vTeamName}
          teamNameStyle={teamNameStyle}
          record={vTeamRecordFormatted}
          scoreStyle={scoreStyle}
          score={vTeamScore}
          favTeam={favoriteTeam}
        />
      </CardContent>
      {cardOpen && (
        <React.Fragment>
          <Divider
            homeSelected={homeSelected}
            toggleDivider={handleToggleOnClick}
          />
          <MatchHighlightsRail videos={youtubevideos} />
          {homeSelected && (
            <PlayerStatsSection
              stats={sortMatchStats(matchStats, hTeamId)}
              videos={youtubevideos}
            />
          )}
          {!homeSelected && (
            <PlayerStatsSection
              stats={sortMatchStats(matchStats, vTeamId)}
              videos={youtubevideos}
            />
          )}
        </React.Fragment>
      )}
    </CardWrapper>
  );
};

export default Card;
