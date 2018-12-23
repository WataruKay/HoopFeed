import React, { useState, useContext } from 'react';
import styled from 'styled-components/macro';
import { animated, Transition } from 'react-spring';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';

import { formatSingleStat } from '../util/stats';

import VideoContext from '../context/VideoContext';
import VideoItem from './VideoItem';
import VideoOverlay from './VideoOverlay';

const ListWrapper = styled(animated.div)`
  width: 90%;
  max-width: 330px;
`;

const ScrollableArea = styled(animated.div)`
  height: 100%;
  margin-top: 55px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  overflow: hidden;
`;

const ListItem = styled.div`
  width: 100%;
  max-height: 200px;
  color: white;
  display: flex;
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

const OpponentName = styled.div`
  font-size: 18px;
  text-decoration: unset;
  color: white;
`;

const GameDate = styled.div`
  font-size: 10px;
  color: #848181;
  margin-top: 5px;
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

const RangeSelectorWrapper = styled(animated.div)`
  width: 100%;
  max-width: 500px;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  padding: 20px 0px;
`;

const RangeSelectItem = styled(animated.div)`
  color: white;
  font-family: 'Fugaz One', cursive;
  font-size: 13px;
  background-color: ${props => (props.selected ? '#5edea4' : 'unset')};
  border-radius: 10px;
  text-transform: uppercase;
  padding: 2px 10px;
  cursor: pointer;
`;

const PlayerViewList = ({ data, selectedRange, setRange }) => {
  const {
    setVideoId,
    toggleVideoOverlay,
    selectedVideo,
    showVideoOverlay,
    videoPlaying,
    toggleVideoPlay,
  } = useContext(VideoContext);
  const opponentTeam = player => {
    if (player.player.teamId === player.match.hTeamId) {
      return player.match.vTeamName;
    } else {
      return `@${player.match.hTeamName}`;
    }
  };

  const hideVideo = () => {
    toggleVideoOverlay(false);
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
  };

  const renderStats = stats => {
    return stats.statsFormatted.map((stat, index) => {
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

  const changeSelectedRange = index => {
    setRange(index);
  };

  const RangeSelector = () => {
    return (
      <RangeSelectorWrapper>
        <RangeSelectItem
          selected={selectedRange === 5}
          onClick={() => changeSelectedRange(5)}
        >
          5 Game Avg
        </RangeSelectItem>
        <RangeSelectItem
          selected={selectedRange === 10}
          onClick={() => changeSelectedRange(10)}
        >
          10 Game Avg
        </RangeSelectItem>
        <RangeSelectItem
          selected={selectedRange === 0}
          onClick={() => changeSelectedRange(0)}
        >
          Season Avg
        </RangeSelectItem>
      </RangeSelectorWrapper>
    );
  };

  const renderTopPerformers = () => {
    return data.map(player => {
      const formatted = formatSingleStat(player.statsJSON);
      const playerVideos = player.match.youtubevideos.filter(
        video =>
          video.player.length > 0 &&
          video.player[0].playerId === player.playerIdFull,
      );
      return (
        <ListItem key={player.id}>
          <ListItemFlexTopRow>
            <LeftSection>
              <OpponentName>{opponentTeam(player)}</OpponentName>
              <GameDate>
                {dayjs(player.match.startDateEastern).format('YYYY/MM/DD')}
              </GameDate>
            </LeftSection>
            <RightSection>
              {formatted.statType !== '' && (
                <PerformanceType>{formatted.statType}</PerformanceType>
              )}
            </RightSection>
          </ListItemFlexTopRow>
          <ListItemFlexRow>
            <Stats>{renderStats(formatted)}</Stats>
          </ListItemFlexRow>
          {playerVideos.length > 0 && (
            <ListItemFlexRow>
              <VideoRow>{renderVideos(playerVideos)}</VideoRow>
            </ListItemFlexRow>
          )}
        </ListItem>
      );
    });
  };
  return (
    <ScrollableArea>
      <RangeSelector />
      <Transition
        native
        items={true}
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
      <Transition
        native
        items={showVideoOverlay}
        from={{ opacity: 0, transform: 'translate3d(-50px,0,0)' }}
        enter={{ opacity: 1, transform: 'translate3d(0px,0,0)' }}
        leave={{ opacity: 0, transform: 'translate3d(-50px,0,0)' }}
      >
        {show =>
          show &&
          (props => (
            <VideoOverlay
              videoId={selectedVideo}
              showVideoOverlay={showVideoOverlay}
              hideVideo={hideVideo}
              videoPlaying={videoPlaying}
              toggleVideoPlay={toggleVideoPlay}
              style={props}
              relatedVideos={[]}
            />
          ))
        }
      </Transition>
    </ScrollableArea>
  );
};

export default PlayerViewList;