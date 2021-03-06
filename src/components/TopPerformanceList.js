import React, { useContext } from 'react';
import styled from 'styled-components/macro';
import { animated, Transition } from 'react-spring';
import { Link } from 'react-router-dom';

import VideoContext from '../context/VideoContext';
import AppContext from '../context/AppContext';
import VideoItem from './VideoItem';

const ListWrapper = styled(animated.div)`
  width: 90%;
  max-width: 330px;
`;

const ListItem = styled.div`
  width: 100%;
  max-height: 200px;
  color: white;
  display: ${props => (props.show === 1 ? 'none' : 'flex')};
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  margin-bottom: 20px;
  background-color: #1e1e1e;
  font-family: 'SF-Pro-Heavy';
  font-size: 16px;
`;

const ListItemFlexRow = styled.div`
  display: flex;
  flex: 1 0 auto;
  width: 100%;
  align-items: center;
`;

const ListItemFlexTopRow = styled(ListItemFlexRow)`
  justify-content: space-between;
  align-items: flex-start;
`;

const LeftSection = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px;
`;

const RightSection = styled.div`
  display: flex;
  background-color: #80808014;
  border-top-right-radius: 5px;
`;

const PlayerName = styled(Link)`
  font-size: 18px;
  text-decoration: unset;
  color: white;
`;

const OpponentName = styled.div`
  font-size: 10px;
`;

const PerformanceType = styled.div`
  font-size: 12px;
  font-family: 'Fugaz One', cursive;
  font-weight: 800;
  text-transform: uppercase;
  padding-top: 5px;
  padding-bottom: 5px;
  padding-left: 15px;
  padding-right: 15px;
  line-height: 1;
`;

const GridItem = styled.div`
  align-items: center;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StatNumber = styled.div`
  color: #848181;
  font-size: 13px;
  font-family: 'SF-Pro-Heavy';
  color: white;
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
  font-variant-numeric: tabular-nums;
  color: ${props => (props.green ? '#5edea4' : 'white')};
`;

const StatType = styled.div`
  display: flex;
  flex: 1;
  justify-content: flex-end;
  align-items: center;
  font-variant-numeric: tabular-nums;
  font-size: 10px;
`;

const Stats = styled.div`
  color: #848181;
  font-size: 10px;
  font-family: 'SF-Pro-Heavy';
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
  grid-gap: 5px;
  padding-left: 10px;
  padding-right: 10px;
  width: 100%;
  margin-bottom: 10px;
`;

const VideoRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  width: 100%;
  padding-bottom: 10px;
`;

const ErrorMsg = styled.span`
  color: white;
  font-weight: 800;
  font-family: 'SF-Pro-Heavy';
  font-size: 18px;
  text-align: center;
`;

const ErrorMsgWrapper = styled.div`
  text-align: center;
`;

const TopPerformanceList = ({
  topPerformers,
  showTopPerformers,
  togglePerformersList,
}) => {
  const {
    toggleTopPerformerListLastOpen,
    topPerformerListLastOpen,
  } = useContext(AppContext);
  const { setVideoId, toggleVideoOverlay } = useContext(VideoContext);
  const opponentTeam = player => {
    if (player.player.teamId === player.player.hTeamId) {
      return player.hTeamName;
    } else {
      return player.vTeamname;
    }
  };

  const statToMakeGreen = statType => {
    return (
      statType === 'PTS' ||
      statType === 'AST' ||
      statType === 'REB' ||
      statType === 'BLK' ||
      statType === 'STL'
    );
  };

  const handleVideoClick = (event, id) => {
    event.stopPropagation();
    setVideoId(id);
    toggleVideoOverlay(true);
    // togglePerformersList(false);
    toggleTopPerformerListLastOpen(true);
    // document.body.style.overflow = 'hidden';
  };

  const renderStats = stats => {
    return stats.map((stat, index) => {
      return (
        <GridItem key={index}>
          <StatNumber
            green={statToMakeGreen(stat.type) && stat.value >= 10 ? 1 : 0}
          >
            {stat.value}
          </StatNumber>
          <StatType>{stat.type}</StatType>
        </GridItem>
      );
    });
  };

  const renderVideos = videos => {
    return videos.map((video, index) => {
      if (index < 3) {
        return (
          <VideoItem
            key={index}
            video={video}
            index={index}
            handleClick={handleVideoClick}
          />
        );
      } else return null;
    });
  };

  const renderTopPerformers = () => {
    if (topPerformers.length > 0) {
      return topPerformers.map(player => {
        return (
          <ListItem
            show={topPerformerListLastOpen ? 1 : 0}
            key={player.playerIdFull}
          >
            <ListItemFlexTopRow>
              <LeftSection>
                <PlayerName to={`/player/${player.playerIdFull}`}>
                  {`${player.player.firstName.substring(0, 1)}. ${
                    player.player.lastName
                  }`}
                </PlayerName>
                <OpponentName>vs {opponentTeam(player)}</OpponentName>
              </LeftSection>
              <RightSection>
                {player.statType !== '' && (
                  <PerformanceType>{player.statType}</PerformanceType>
                )}
              </RightSection>
            </ListItemFlexTopRow>
            <ListItemFlexRow>
              <Stats>{renderStats(player.statsFormatted)}</Stats>
            </ListItemFlexRow>
            {player.videos.length > 0 && (
              <ListItemFlexRow>
                <VideoRow>{renderVideos(player.videos)}</VideoRow>
              </ListItemFlexRow>
            )}
          </ListItem>
        );
      });
    } else {
      return (
        <ErrorMsgWrapper>
          <ErrorMsg>No Data Available</ErrorMsg>
        </ErrorMsgWrapper>
      );
    }
  };
  return (
    <Transition
      native
      items={showTopPerformers}
      from={{ opacity: 0 }}
      enter={{ opacity: 1 }}
    >
      {show =>
        show &&
        (props => (
          <ListWrapper style={props}>{renderTopPerformers()}</ListWrapper>
        ))
      }
    </Transition>
  );
};

export default TopPerformanceList;
