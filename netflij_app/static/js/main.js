'use-strict';

$(document).ready(netflij);


class Show extends React.Component {
  constructor(props) {
    super(props);
    this.state = {fadeOut: false};
    this.fadeOut = this.fadeOut.bind(this);
    setTimeout(this.fadeOut, this.props.delay);
  }

  fadeOut() {
    this.setState({fadeOut: true});
  }

  getGenres(genresString) {
    let rows = []
    let genres = genresString.split(',')
    for (var i = 0; i < genres.length; i++) {
      rows.push(<span>  { genres[i].trim() }  </span>)
      if (i + 1 < genres.length) {
        rows.push(<i className="fa fa-circle" aria-hidden="true"></i>)
      }
    }
    return rows
  }

  render() {
    const showUID = this.props.showUID;
    const genres = this.props.genres;
    const description = this.props.description;
    const name = this.props.name;
    const announcement = this.props.announcement;
    const inFadeOut = this.state.fadeOut;
    let onError = false;
    return (<li className={inFadeOut ? "fadeout" : "fadein"} style={{ opacity:100 }}>
      <div>
        <div data-ratio="square">
          <div className="titleLeft" align="center">
            <img
              src={`/static/shows/${showUID}/logo.svg`}
              onError={({ currentTarget }) => {
                if (!onError) {
                  onError = true; // prevents looping
                  currentTarget.src=`/static/shows/${showUID}/logo`;
                }
              }}
              alt="Logo"
            />

            <div className="titleGenres">
            {
              this.getGenres(genres.toString())
            }                
            </div>
          </div>
          {
            description.length > 0 ? 
            <span className="description-text">
              <div className="wrapper">
                { genres.length > 0 ?
                  <span className="genres">
                    <span className="prefix">Genres: </span>{ genres }
                    <br/>
                  </span>
                  : ''
                }
                <span style={{paddingTop: '5px', display: 'block'}}>{ description }</span>
              </div>
            </span>
            : ''
          }
        </div>
        <footer>
          { announcement }
        </footer>
      </div>
      <img
        src={`/static/shows/${showUID}/background`}
        alt="Slide"
        style={{width: '100%', height: '100%' }}
      />
    </li>);
  }
}

var DEFAULT_INTERVAL = 20; 
function getInterval() {
  let params = new URLSearchParams(window.location.search);
  return parseInt(params.get("interval")) || DEFAULT_INTERVAL;
}
class ShowsManager extends React.Component {
  constructor(props) {
    super(props);
    this.next = this.next.bind(this);
    this.previous = this.previous.bind(this);
    this.onkeydown = this.onkeydown.bind(this);
    document.onkeydown = this.onkeydown;
    this.fetch = this.fetch.bind(this);
    this.state = {currentIndex: -1, uid: 0, description: "", delay: (getInterval() - 2) * 1000, timeoutID: 0, name: "", genres: []};
    this.next();
  }

  onkeydown(e) {
    e = e || window.event;
    if (e.keyCode == '38') {
        // up arrow
    }
    else if (e.keyCode == '40') {
        // down arrow
    }
    else if (e.keyCode == '37') {
       this.previous();
    }
    else if (e.keyCode == '39') {
       this.next();
    }
  }

  previous() {
    const resultInResponse = this.props.result;
    const currentIndex = this.state.currentIndex;
    const newIndex = (resultInResponse.total + currentIndex - 1) % resultInResponse.total;
    this.fetch(newIndex)
  }

  next() {
    /* 
    Doing it this way esnures we don't have to refresh when new shows are available
    or when a show was altered
    */
    const resultInResponse = this.props.result;
    const currentIndex = this.state.currentIndex;
    const newIndex = (resultInResponse.total + currentIndex + 1) % resultInResponse.total;
    this.fetch(newIndex)
  }

  fetch(index) {
    const pageSeed = this.props.seed;
    fetch(`/next?seed=${pageSeed}&currentIndex=${index}`).then(response => response.json()).then(data => {
      if (data.status) {
        clearTimeout(this.state.timeoutID);
        const timeoutID = setTimeout(this.next, getInterval() * 1000);
        this.setState({
          currentIndex: index,
          uid: data.uid,
          description: data.description,
          name: data.name,
          announcement: data.announcement,
          genres: data.genres,
          timeoutID
        });
      }
    });
  }

  render() {
    return (
      <Show
        key={this.state.uid}
        delay={this.state.delay}
        showUID={this.state.uid}
        description={this.state.description}
        name={this.state.name}
        announcement={this.state.announcement}
        genres={this.state.genres}
      />);
  }
}


function netflij() {
    const pageSeed = parseInt(seed.innerText);
    fetch(`/next?seed=${pageSeed}&currentIndex=0`).then(response => response.json()).then(data => {
      if (data.status) {
        ReactDOM.render(<ShowsManager result={data} seed={pageSeed}/>, document.querySelector('#results'));
      }
    });
}