import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ArrowDown from './assets/arrowDown.svg';
import ArrowUp from './assets/arrowUp.svg';
import Check from './assets/check.svg';
import './styles/global.css';

class Dropdown extends Component {
  constructor(props) {
    super(props);
    const { title, list } = this.props;

    this.state = {
      isListOpen: false,
      title,
      selectedItem: null,
      keyword: '',
      list,
    };

    this.searchField = React.createRef();
  }

  componentDidMount() {
    const { select } = this.props;
  
    if (select) {
      this.selectSingleItem(select);
    }
  }
  
  componentDidUpdate(prevProps) {
    const { select } = this.props;
    const { isListOpen } = this.state;
  
    // Handling the change in selection based on the 'select' prop
    if (select?.value != prevProps.select?.value) { // I am not a huge fan of the prop requiring an object with a "value" key..but leaving it alone for now
      this.selectSingleItem(select);
    }
  
    // Existing functionality for handling click events
    setTimeout(() => {
      if (isListOpen) {
        window.addEventListener('click', this.close);
      } else {
        window.removeEventListener('click', this.close);
      }
    }, 0);
  }
  

  componentWillUnmount() {
    window.removeEventListener('click', this.close);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { list } = nextProps;

    if (JSON.stringify(list) !== JSON.stringify(prevState.list)) {
      return { list };
    }

    return null;
  }

  close = () => {
    this.setState({
      isListOpen: false,
    });
  }

  clearSelection = () => {
    const { name, title, onChange } = this.props;

    this.setState({
      selectedItem: null,
      title,
    }, () => {
      onChange(null, name);
    });
  }

  selectSingleItem = (item) => {
    const { list } = this.props;

    const selectedItem = list.find((i) => i.value === item.value);
    this.selectItem(selectedItem);
  }

  selectItem = (item) => {
    const { list, selectedItem } = this.state;
    const { name, onChange, title } = this.props;
    if(!item){
      return this.setState({
        title: title,
        isListOpen: false,
        selectedItem: null,
      }, () => selectedItem?.value !== value && onChange(item, name));
    }
    const { label, value } = item;
    let foundItem;

    if (!label) {
      foundItem = list.find((i) => i.value === item.value);
    }

    this.setState({
      title: label || foundItem.label,
      isListOpen: false,
      selectedItem: item,
    }, () => selectedItem?.value !== value && onChange(item, name));
  }

  toggleList = () => {
    this.setState((prevState) => ({
      isListOpen: !prevState.isListOpen,
      keyword: '',
    }), () => {
      if (this.state.isListOpen && this.searchField.current) {
        this.searchField.current.focus();
        this.setState({
          keyword: '',
        });
      }
    });
  }

  filterList = (e) => {
    this.setState({
      keyword: e.target.value.toLowerCase(),
    });
  }

  listItems = () => {
    const {
      id,
      searchable,
      checkIcon,
      styles,
    } = this.props;
    const { listItem, listItemNoResult } = styles;
    const { keyword, list } = this.state;
    let tempList = [...list];
    const selectedItemValue = this.state.selectedItem?.value;

    if (keyword.length) {
      tempList = list.filter((item) => item.label.toLowerCase().includes(keyword.toLowerCase()));
    }

    if (tempList.length) {
      return (
        tempList.map((item) => (
          <button
            type="button"
            className={`dd-list-item ${id}`}
            style={listItem}
            key={item.value}
            onClick={() => this.selectItem(item)}
            onMouseEnter={() => {
              if(this.props.onMouseEnter){
                this.props.onMouseEnter(item)
              }
            }}
          >
            {item.label}
            {' '}
            {item.value === selectedItemValue && (
              <span style={styles.checkIcon}>
                {checkIcon || <Check />}
              </span>
            )}
          </button>
        ))
      );
    }

    return (
      <div
        className={`dd-list-item no-result ${id}`}
        style={listItemNoResult}
      >
        {searchable[1]}
      </div>
    );
  }

  render() {
    const {
      id,
      searchable,
      arrowUpIcon,
      arrowDownIcon,
      styles,
      immutable,
    } = this.props;
    const { isListOpen, title } = this.state;

    const {
      wrapper,
      header,
      headerTitle,
      headerArrowUpIcon,
      headerArrowDownIcon,
      list,
      listSearchBar,
      scrollList,
    } = styles;


    const disabledHeader = {}; Object.assign(disabledHeader, header);
    const disabledHeaderTitle = {}; Object.assign(disabledHeaderTitle, headerTitle);
    const disabledHeaderArrowDownIcon = {}; Object.assign(disabledHeaderArrowDownIcon, headerArrowDownIcon);   
    disabledHeader.backgroundColor = "lightgray";
    disabledHeaderTitle.color = "gray";
    disabledHeaderArrowDownIcon.color = "gray";

    return (
      <span
        className={`dd-wrapper ${id}`}
        style={wrapper}
      >
        <button
          type="button"
          className={`dd-header ${id}`}
          style={immutable ? disabledHeader : header}
          onClick={() => {if(!immutable) { this.toggleList()}}}
          onMouseEnter={() => {
            if(this.state.selectedItem){
              if(this.props.onHeaderMouseEnter){
                this.props.onHeaderMouseEnter(this.state.selectedItem);
              } else if(this.props.onMouseEnter){
                this.props.onMouseEnter(this.state.selectedItem);
              }
            }
          }}
        >
          <div
            className={`dd-header-title ${id}`}
            style={immutable ? disabledHeaderTitle : headerTitle}
          >
            {title}
          </div>
          {isListOpen
            ? <span style={headerArrowUpIcon}>{arrowUpIcon || <ArrowUp />}</span>
            : <span style={immutable ? disabledHeaderArrowDownIcon : headerArrowDownIcon}>{arrowDownIcon || <ArrowDown />}</span>}
        </button>
        {isListOpen && (
          <div
            className={`dd-list${searchable ? ' searchable' : ''} ${id}`}
            style={list}
          >
            {searchable
            && (
            <input
              ref={this.searchField}
              className={`dd-list-search-bar ${id}`}
              style={listSearchBar}
              placeholder={searchable[0]}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => this.filterList(e)}
            />
            )}
            <div
              className={`dd-scroll-list ${id}`}
              style={scrollList}
            >
              {this.listItems()}
            </div>
          </div>
        )}
      </span>
    );
  }
}

Dropdown.defaultProps = {
  id: '',
  select: undefined,
  searchable: undefined,
  styles: {},
  arrowUpIcon: null,
  arrowDownIcon: null,
  checkIcon: null,
};

Dropdown.propTypes = {
  id: PropTypes.string,
  styles: PropTypes.shape({
    wrapper: PropTypes.string,
    header: PropTypes.string,
    headerTitle: PropTypes.string,
    headerArrowUpIcon: PropTypes.string,
    headerArrowDownIcon: PropTypes.string,
    checkIcon: PropTypes.string,
    list: PropTypes.string,
    listSearchBar: PropTypes.string,
    scrollList: PropTypes.string,
    listItem: PropTypes.string,
    listItemNoResult: PropTypes.string,
  }),
  title: PropTypes.string.isRequired,
  list: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  })).isRequired,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  select: PropTypes.shape({ value: PropTypes.string }),
  searchable: PropTypes.shape([PropTypes.string, PropTypes.string]),
  checkIcon: PropTypes.elementType,
  arrowUpIcon: PropTypes.elementType,
  arrowDownIcon: PropTypes.elementType,
};

export default Dropdown;
