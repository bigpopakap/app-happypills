import React from 'react';
import styled from 'styled-components';
import { SizeMe } from 'react-sizeme';
import { darken } from 'polished';
import { ObjectUtil } from 'ts-null-or-undefined';

import Pill from './Pill';

import {
  MoodLevel,
  STRONG_POSITIVE,
  POSITIVE,
  NEUTRAL,
  NEGATIVE,
  STRONG_NEGATIVE
} from 'utils/tags';

const DELAYED_SLIDER_OPEN_WAIT_TIME_MILLIS = 250;
const SLIDER_OPEN_ANIMATION_DURATION_MILLIS = 150;

/* ******************************************************
                        PROPS AND STATE
 ****************************************************** */

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The name of the tag. This is displayed to the user.
   */
  displayText: string;

  /**
   * The color to display this pill as.
   */
  color: string;

  /**
   * Whether the pill is actively selected.
   */
  active: boolean;

  /**
   * Scale of 1 to 5. Optional.
   */
  value: MoodLevel;

  /**
   * Handler for when the value updates
   * @param updatedValued the updated value
   */
  valueUpdated: (updatedValued: MoodLevel) => void;
}

interface State {
  isSliderOpen: boolean;
}

/* ******************************************************
                      STYLED COMPONENTS
 ****************************************************** */

const StyledContainer = styled.div`
  /* For vertically centering the slider */
  position: relative;

  cursor: pointer;

  /* Disable text highlighting because it messes with the mouse drag behavior */
  user-select: none;
`;

const StyledLabel = styled(Pill)`
  min-width: 60px;
`;

interface StyledSliderProps {
  visible: boolean;
  height: number | null;
}

// TODO need to add aria-hidden when this thing is hidden
const StyledSlider = styled(Pill)<StyledSliderProps>`
  /* Use visibility because we want to be able to calculate the rendered height
     of the slider before it is shown. */
  visibility: ${props => (props.visible ? null : 'hidden')};

  position: absolute;
  z-index: 100;
  top: ${props => {
    const height = props.height || 0;
    return `calc(50% - ${height / 2}px)`;
  }};

  width: 100%;
`;

const StyledSliderOption = styled.li`
  padding: 4px;

  text-align: center;

  border-radius: 4px;

  &:hover {
    background-color: ${props => darken(0.2, props.color || '')};
  }
`;

/* ******************************************************
                      THE COMPONENT
 ****************************************************** */

type Timer = number | null;

export default class Tag extends React.Component<Props, State> {
  private delayOpenSliderTimer: Timer;

  public constructor(props: Readonly<Props>) {
    super(props);

    this.state = {
      isSliderOpen: false
    };

    this.delayOpenSliderTimer = null;

    this.openSlider = this.openSlider.bind(this);
    this.delayOpenSlider = this.delayOpenSlider.bind(this);
    this.clearTimer = this.clearTimer.bind(this);
    this.closeSlider = this.closeSlider.bind(this);
    this.valueUpdated = this.valueUpdated.bind(this);
  }

  private openSlider() {
    // If we were going to open the slider, cancel it because
    // we are opening it immediately instead
    this.clearTimer(this.delayOpenSliderTimer);

    this.setState({
      isSliderOpen: true
    });
  }

  private delayOpenSlider() {
    this.clearTimer(this.delayOpenSliderTimer);

    this.delayOpenSliderTimer = setTimeout(() => {
      this.openSlider();
      this.delayOpenSliderTimer = null;
    }, DELAYED_SLIDER_OPEN_WAIT_TIME_MILLIS);
  }

  private closeSlider() {
    // If we were going to open the slider, cancel it because
    // we are closing it now
    this.clearTimer(this.delayOpenSliderTimer);

    this.setState({
      isSliderOpen: false
    });
  }

  private valueUpdated(updatedValue: MoodLevel) {
    this.props.valueUpdated(updatedValue);
    this.closeSlider();
  }

  private clearTimer(timer: Timer) {
    if (!ObjectUtil.isNullOrUndefined(timer)) {
      clearTimeout(timer);
    }
  }

  public render() {
    const listOption = (moodLevel: MoodLevel) => {
      return (
        <StyledSliderOption
          color={this.props.color}
          onClick={() => this.valueUpdated(moodLevel)}
          onMouseUp={() => this.valueUpdated(moodLevel)}
        >
          {moodLevel.emoji}
        </StyledSliderOption>
      );
    };

    return (
      <StyledContainer
        className={this.props.className}
        draggable={false}
        onMouseLeave={this.closeSlider}
        onMouseDown={this.openSlider}
        onMouseEnter={this.delayOpenSlider}
        onMouseMove={this.delayOpenSlider}
      >
        <StyledLabel color={this.props.color}>
          {this.props.displayText}
          {ObjectUtil.isNullOrUndefined(this.props.value) ? null : this.props.value.emoji}
        </StyledLabel>

        <SizeMe monitorHeight>
          {({ size }) => (
            <StyledSlider
              color={this.props.color}
              visible={this.state.isSliderOpen}
              height={size.height}
            >
              <ol>
                {listOption(STRONG_POSITIVE)}
                {listOption(POSITIVE)}
                {listOption(NEUTRAL)}
                {listOption(NEGATIVE)}
                {listOption(STRONG_NEGATIVE)}
              </ol>
            </StyledSlider>
          )}
        </SizeMe>
      </StyledContainer>
    );
  }
}
