import { h, Text, Component } from 'ink'
import PropTypes from 'prop-types'
import { inspect } from 'util'
import NotFound from './notFound'
import withRouter from './withRouter'
import { makeLocationMatcher } from './utils'

class Switch extends Component {
  static propTypes = {
    children: PropTypes.arrayOf(
      PropTypes.shape({
        _props: PropTypes.shape({
          path: PropTypes.string,
          exact: PropTypes.bool
        })
      })
    ).isRequired,
    notFound: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.instanceOf(Component)
    ])
  }

  static defaultProps = {
    children: [],
    notFound: NotFound
  }

  constructor(props, context) {
    super(props, context)
    this.setPathsToMatch(props)
    this.state = this.matchLocation(props.location)
  }

  componentWillReceiveProps(newProps) {
    if (newProps.children !== this.props.children) {
      this.setPathsToMatch(newProps)
    }
    if (
      !this.props.location ||
      newProps.location.key !== this.props.location.key
    ) {
      this.setLocation(newProps)
    }
  }

  setPathsToMatch({ children }) {
    this.locationMatchers = children.map(({ _props: { path = '/', exact } }) =>
      makeLocationMatcher(path, exact)
    )
  }

  matchLocation(location) {
    return (
      this.locationMatchers.reduce((found, matcher, matchIndex) => {
        if (found) return found
        const match = matcher(location)
        return match ? { match, matchIndex } : null
      }, null) || {}
    )
  }

  setLocation({ location }) {
    this.setState(this.matchLocation(location))
  }

  render(
    { children, location, history, notFound: NotFound },
    { match, matchIndex }
  ) {
    if (!match) {
      return (
        <NotFound location={location} history={history} children={children} />
      )
    }
    return children[matchIndex]
  }
}

export default withRouter(Switch)
