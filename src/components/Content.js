import React, { useContext, useEffect } from 'react';
import styled from 'styled-components/macro';
import { Trail, animated, Transition } from 'react-spring';
import { Query } from 'react-apollo';
import { withApollo } from 'react-apollo';
import MatchByDateQuery from '../queries/MatchByDate';
import { formatDate } from '../util/date';

import AppContext from '../context/AppContext';
import VideoContext from '../context/VideoContext';
import Card from './Card';
import VideoOverlay from './VideoOverlay';
import LoadingIndicator from './LoadingIndicator';
import AboveContentButtons from './AboveContentButtons';
import TopPerformanceList from './TopPerformanceList';
import StreamableList from './StreamableList';
import { findTopPerformers } from '../util/stats';

const ScrollableArea = styled(animated.div)`
  height: 100%;
  margin-top: 55px;
  display: ${props => (props.show === 1 ? 'none' : 'flex')};
  align-items: center;
  justify-content: center;
  flex-direction: column;
  overflow: hidden;
`;

const NoData = styled.div`
  color: white;
  font-size: 36px;
  font-family: 'Fugaz One', cursive;
  font-weight: 800;
  top: 50%;
  position: absolute;
  text-transform: uppercase;
`;

const CardContainer = styled(animated.div)`
  :first-child {
    margin-top: 20px;
  }
  display: ${props => (props.show === 1 ? 'none' : 'inherit')};
`;

const Content = ({ client }) => {
  const {
    selectedIndex,
    setIndex,
    matchDate,
    togglePerformersList,
    showMatches,
    toggleMatchesList,
    showTopPerformers,
    showStreamables,
    toggleStreamablesList,
    setShowDate,
    favoriteTeam,
    topPerformerListLastOpen,
    toggleTopPerformerListLastOpen,
    showOptionsOverlay,
  } = useContext(AppContext);

  const {
    selectedVideo,
    showVideoOverlay,
    toggleVideoOverlay,
    videoPlaying,
    toggleVideoPlay,
    setSelectedMatchVideos,
    selectedMatchVideos,
  } = useContext(VideoContext);

  useEffect(() => {
    setShowDate(true);
  }, []);

  const hideVideo = () => {
    toggleVideoOverlay(false);
    if (topPerformerListLastOpen) {
      toggleTopPerformerListLastOpen(false);
    }
  };

  const onSelect = (index, youtubevideos = []) => {
    setIndex(index);
    setSelectedMatchVideos(youtubevideos);
  };

  const togglePerformerList = () => {
    togglePerformersList(showTopPerformers ? true : !showTopPerformers);
    toggleStreamablesList(false);
    toggleMatchesList(false);
    setIndex(null);
    setSelectedMatchVideos([]);
  };

  const toggleStreamableList = () => {
    toggleStreamablesList(showStreamables ? true : !showStreamables);
    togglePerformersList(false);
    toggleMatchesList(false);
    setIndex(null);
    setSelectedMatchVideos([]);
  };

  const toggleMatchList = () => {
    toggleMatchesList(showMatches ? true : !showMatches);
    togglePerformersList(false);
    toggleStreamablesList(false);
    setIndex(null);
    setSelectedMatchVideos([]);
  };

  return (
    <Query
      query={MatchByDateQuery}
      variables={{ date: formatDate(matchDate, 1) }}
    >
      {({ loading, error, data }) => {
        if (loading) return <LoadingIndicator />;
        if (error) return <div>{`Error: ${error}`}</div>;
        if (data.matchByDate.length === 0) {
          return (
            <ScrollableArea>
              <NoData>No matches</NoData>;
            </ScrollableArea>
          );
        }
        return (
          <ScrollableArea show={showOptionsOverlay ? 1 : 0}>
            <AboveContentButtons
              togglePerformerList={togglePerformerList}
              showTopPerformers={showTopPerformers}
              toggleStreamableList={toggleStreamableList}
              showStreamables={showStreamables}
              showMatches={showMatches}
              toggleMatchesList={toggleMatchList}
            />
            {showTopPerformers && (
              <TopPerformanceList
                topPerformers={findTopPerformers(data.matchByDate)}
                showTopPerformers={showTopPerformers}
                togglePerformersList={togglePerformersList}
              />
            )}
            {showStreamables && (
              <StreamableList showStreamables={showStreamables} />
            )}
            {showMatches && (
              <Trail
                native
                items={data.matchByDate}
                from={{
                  opacity: 0,
                  transform: 'translateX(-100px)',
                }}
                to={{
                  opacity: 1,
                  transform: 'translateX(0px)',
                }}
                keys={item => item.matchId}
              >
                {(item, index) => props => (
                  // work around for https://github.com/styled-components/styled-components/issues/1198
                  <CardContainer style={props} show={showVideoOverlay ? 1 : 0}>
                    <Card
                      {...item}
                      favoriteTeam={favoriteTeam}
                      index={index}
                      selectedIndex={selectedIndex}
                      onSelect={onSelect}
                      showVideoOverlay={showVideoOverlay}
                    />
                  </CardContainer>
                )}
              </Trail>
            )}
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
                    relatedVideos={selectedMatchVideos}
                  />
                ))
              }
            </Transition>
          </ScrollableArea>
        );
      }}
    </Query>
  );
};

export default withApollo(Content);
