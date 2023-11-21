import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { kaReducer, Table } from "ka-table";
import { kaPropsUtils } from "ka-table/utils";
import {
  DataType,
  SortingMode,
  SortDirection,
  ActionType,
  EditingMode
} from "ka-table/enums";
import {
  resizeColumn,
  closeEditor,
  showLoading,
  hideLoading,
  search,
  updatePageIndex,
  hideDetailsRow,
  showDetailsRow,
  hideColumn,
  showColumn,
  deselectAllFilteredRows,
  deselectRow,
  selectAllFilteredRows,
  selectRow,
  selectRowsRange
} from "ka-table/actionCreators";
import CellEditorBoolean from "ka-table/Components/CellEditorBoolean/CellEditorBoolean";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CSVLink } from "react-csv";
import Checkbox from "react-simple-checkbox";
import {
  TableMain,
  TableHeader,
  TableHeaderPadding,
  TableHeaderInner,
  TableHeaderInnerText,
  TableHeaderInnerIcon,
  SearchContainer,
  SearchContainerPadding,
  SearchContainerInner,
  SearchContainerSection,
  SearchInput,
  TableButton,
  SearchInputWrapper,
  SearchButtonWrapper,
  PaginationMain,
  PaginationContainer,
  PaginationSection,
  Cell,
  TableText,
  DetailsInner,
  GroupHeader,
  GroupHeaderPadding,
  GroupHeaderInner,
  GroupHeaderIcon,
  GroupHeaderText,
  GroupHeaderAppendage,
  GroupHeaderCount,
  FilterContainer,
  FilterContainerPadding,
  FilterContainerInner,
  FilterHeader,
  NewItemFieldWrapper,
  NewItemFieldWrapperPadding,
  NewItemFieldWrapperInner,
  NewItemFieldInput,
  NewItemWrapper,
  FieldWrapperFields,
  EditorInput,
  EditorSelect,
  EditorContainer,
  EditorSelectLabel
} from "./style";
import "ka-table/style.css";
import { capitalize } from "../../utilities";
import { Button } from "../../global-components";
import firebase from "../../firebase";
import { getDatabase, ref, onValue } from "firebase/database";
import FilterControl from "react-filter-control";
import { filterData, operators } from './FilterData';
import { uniqBy, isEmpty, get, isEqual, findIndex, omit } from "lodash";
import { showNotification } from "../../store/actions/notification";
import { theme } from "../../global-styles";
import { Fragment } from "react";
import moment from "moment";
import { toastr } from "react-redux-toastr";
const db = getDatabase(firebase);

let is_shift = false
document.addEventListener("keydown", (e) => {
  if (e.shiftKey) is_shift = true;
});
document.addEventListener("keyup", (e) => {
  if (!e.shiftKey) is_shift = false;
});

const groups = [
  {
    caption: "And",
    name: "and",
  },
  {
    caption: "Or",
    name: "or",
  }
];

const CustomCellEditor = ({ rowData, column, rowKeyValue, dispatch, value = "" }) => {
  const close = () => {
    dispatch(resizeColumn(column.key, 125));
    dispatch(closeEditor(rowKeyValue, column.key));
  };
  const [editorValue, setValue] = useState(value);
  return (
    <EditorContainer>
      <EditorInput
        type={column.editorType || "text"}
        autoFocus={true}
        onFocus={(event) => event.target.select()}
        autoComplete="new-password"
        value={column.editorType === "date" ? moment(editorValue).format("YYYY-MM-DD") : editorValue}
        onChange={(event) => setValue(event.currentTarget.value)}
      />
      <Button
        nomargin
        small
        green
        disabled={!editorValue}
        onClick={() => {
          dispatch(showLoading("Saving..."));
          dispatch({ type: "UpdateCellValue", rowKeyValue, columnKey: column.key, value: editorValue, rowData });
          close();
        }}>
        Save
      </Button>
      <Button
        nomargin
        marginleft={5}
        small
        danger
        onClick={close}>
        Cancel
      </Button>
    </EditorContainer>
  );
};

const CustomCellSelect = ({ rowData, column, rowKeyValue, dispatch, value = "" }) => {
  const initialValue = value;
  const close = () => {
    dispatch(resizeColumn(column.key, 125));
    dispatch(closeEditor(rowKeyValue, column.key));
  };
  const [editorValue, setValue] = useState(value);
  return (
    <EditorContainer>
      <EditorSelectLabel>
        <EditorSelect value={editorValue} onChange={(event) => setValue(event.currentTarget.value)}>
          <option value={editorValue}>{capitalize(editorValue)}</option>
          {column.options.filter((o) => o.value !== editorValue).map((option, index) => {
            return <option key={index} value={option.value}>{capitalize(option.label)}</option>
          })}
        </EditorSelect>
      </EditorSelectLabel>
      <Button
        nomargin
        marginleft={5}
        small
        green
        disabled={!editorValue || (initialValue === editorValue)}
        onClick={() => {
          dispatch(showLoading("Saving..."));
          dispatch({ type: "UpdateCellValue", rowKeyValue, columnKey: column.key, value: editorValue, rowData });
          close();
        }}>
        Save
      </Button>
      <Button
        nomargin
        marginleft={5}
        small
        danger
        onClick={close}>
        Cancel
      </Button>
    </EditorContainer>
  );
};

const CustomRow = (props) => {
  const { updateRowData } = props;
  let rowData = useRef(props.rowData);
  let presence = useRef({ last_activity: null, logins: 0, device: null, idle: false, online: false });
  let unsubscribe_ref = useRef(null);
  const columns = props.columns;
  const childComponents = props.childComponents;

  useEffect(() => {
    return () => {
      unsubscribe_ref.current && unsubscribe_ref.current();
      unsubscribe_ref.current = null;
      rowData.current = {};
      presence.current = {};
    }
  }, []);

  useEffect(() => {
    const user_ref = ref(db, `online/${process.env.REACT_APP_STAGE || "development"}/${rowData.current.cognito_id}`);
    const unsubscribe = onValue(user_ref, (snapshot) => {
      rowData.current = { ...rowData.current, ...presence.current, ...(snapshot.val() ? { ...snapshot.val() } : {}) };
      updateRowData(rowData.current);
    });
    unsubscribe_ref.current = unsubscribe;
  }, [updateRowData]);
  
  const rowElements = columns.map((col, index) => {
    const rowProps = { column: col, value: rowData.current[col.key], rowData: rowData.current, rowKeyValue: props.rowKeyValue, field: col.key, dispatch: props.dispatch, isDetailsRowShown: props.isDetailsRowShown };
    const content = childComponents.cellText.content(rowProps);
    const { onClick } = childComponents.cellText.elementAttributes();
    const cellElementAttributes = childComponents.cell.elementAttributes(rowProps);

    return (
      <td key={index} className="ka-cell" {...cellElementAttributes}>
        <div className="ka-cell-text" onClick={(e) => onClick(e, { childProps: rowProps })}>
          {content}
        </div>
      </td>
    );
  });

  return rowElements;
};

const GroupCell = (props, tableProps, dispatch) => {
  if (props.column.key) {
    const group = tableProps.groups.find((g) => g.columnKey === props.column.key);
    return (
      <GroupHeader onClick={() => dispatch({ type: "UpdateGroupsExpanded", groupKey: [props.groupKey] })}>
        <GroupHeaderPadding>
          <GroupHeaderInner>
            <GroupHeaderIcon>
              {!group.icon.Component
                ? <FontAwesomeIcon icon={["fad", props.isExpanded ? group.icon.open : group.icon.closed]} />
                : group.icon.Component(group, props, tableProps, dispatch)
              }
            </GroupHeaderIcon>
            <GroupHeaderText>{capitalize(props.groupKey[props.groupKey.length - 1])}</GroupHeaderText>
            {props.column.groupAppendage
              ? <GroupHeaderAppendage>{props.column.groupAppendage(group, props, tableProps.data)}</GroupHeaderAppendage>
              : null
            }
            {props.column.groupCount
              ? <GroupHeaderCount>{props.column.groupCount(group, props, tableProps.data)}</GroupHeaderCount>
              : null
            }
          </GroupHeaderInner>
        </GroupHeaderPadding>
      </GroupHeader>
    );
  }
}

const DetailsButton = (props) => {
  const [loading_state, setLoading] = useState({});
  const rootDispatch = useDispatch();
  if (props.is_authorized) {
    const buttons = props.column.buttons(props.rowData, props).filter((b) => (typeof b.show === "function" ? b.show() : b.show));

    if (buttons.length > 3) {
      return (
        <Button nomargin blue small onClick={() => {
          props.dispatch(props.isDetailsRowShown ? hideDetailsRow(props.rowKeyValue) : showDetailsRow(props.rowKeyValue));
        }}>
          {props.isDetailsRowShown ? <FontAwesomeIcon icon={["fas", "chevron-up"]} /> : <FontAwesomeIcon icon={["fas", "chevron-down"]} />}
        </Button>
      );
    } else if (buttons.length) {
      return (
        <>
          {buttons.map((button, index) => {
            const key = `loading_${props.rowKeyValue}_${index}`;
            if (button.link) {
              return (
                <a {...((button.tooltipProps && button.tooltipProps["data-tooltip-content"]) && button.tooltipProps)} key={key} rel="noopener noreferrer" target="_blank" href={button.link}>
                  <button.Component {...button.props}>{button.text}</button.Component>
                </a>
              );
            } else if (button.onClick) {
              return (
                <Fragment key={key}>
                  {
                  loading_state[key] && button.onClick.async && !button.text
                    ? <FontAwesomeIcon size="xl" icon={["fal", "spinner"]} spin />
                    : <span {...((button.tooltipProps && button.tooltipProps["data-tooltip-content"]) && button.tooltipProps)}><button.Component key={key} {...button.props} onClick={() => clickHandler(button.onClick, setLoading, rootDispatch, key, props.dispatch, button.props.promptable, button.props.prompt)}>{loading_state[key] && button.onClick.async ? <FontAwesomeIcon icon={["fal", "spinner"]} spin /> : button.text}</button.Component></span>
                  }
                </Fragment>
              );
            }
            return null;
          })}
        </>
      );
    }
  }
  return null;
};

const DetailsRow = (props) => {
  const column = props.columns.find((c) => c.key === "show-hide-details-row");
  const buttons = column.buttons(props.rowData, props).filter((b) => (typeof b.show === "function" ? b.show() : b.show));
  const [loading_state, setLoading] = useState({});
  const rootDispatch = useDispatch();

  return (
    <DetailsInner>
      {buttons.map((button, index) => {
        const key = `loading_${props.rowKeyValue}_${index}`;
        if (button.link) {
          return (
            <a {...((button.tooltipProps && button.tooltipProps["data-tooltip-content"]) && button.tooltipProps)} key={key} rel="noopener noreferrer" target="_blank" href={button.link}>
              <button.Component {...button.props}>{button.text}</button.Component>
            </a>
          );
        } else if (button.onClick) {
          return (
            <Fragment key={key}>
              {
              loading_state[key] && button.onClick.async && !button.text
                ? <FontAwesomeIcon size="xl" icon={["fat", "spinner"]} spin />
                : <span {...((button.tooltipProps && button.tooltipProps["data-tooltip-content"]) && button.tooltipProps)}><button.Component key={key} {...button.props} onClick={() => clickHandler(button.onClick, setLoading, rootDispatch, key, props.dispatch, button.props.promptable, button.props.prompt)}>{loading_state[key] && button.onClick.async ? <FontAwesomeIcon icon={["fal", "spinner"]} spin /> : button.text}</button.Component></span>
              }
            </Fragment>
          );
        }
        return null;
      })}
    </DetailsInner>
  );
};

const SelectionCell = ({ rowKeyValue, dispatch, isSelectedRow, selectedRows }) => {
  return (
    <Checkbox
      checked={isSelectedRow}
      borderThickness={3}
      size={2}
      tickSize={2}
      onChange={(is_checked) => {
        if (is_shift) {
          dispatch(selectRowsRange(rowKeyValue, [...selectedRows].pop()));
        } else if (is_checked) {
          dispatch(selectRow(rowKeyValue));
        } else {
          dispatch(deselectRow(rowKeyValue));
        }
      }}
    />
  );
};

const SelectionHeader = ({ dispatch, areAllRowsSelected }) => {
  return (
    <Checkbox
      checked={areAllRowsSelected}
      borderThickness={3}
      size={2}
      tickSize={2}
      onChange={(is_checked) => {
        if (is_checked) {
          // selectAllVisibleRows();
          // selectAllRows();
          dispatch(selectAllFilteredRows());
        } else {
          // deselectAllVisibleRows();
          // deselectAllRows();
          dispatch(deselectAllFilteredRows());
        }
      }}
    />
  );
};

const clickHandler = async (onClick, setLoading, rootDispatch, key, dispatch, promptable, prompt) => {
  const action = () => {
    if (onClick.async) {
      setLoading((prev) => ({ ...prev, [key]: true }));
      rootDispatch(onClick.handler(...onClick.arguments))
        .then((result) => {
          setLoading({});
          if (onClick.callback) {
            if (onClick.callback.dispatch) rootDispatch(onClick.callback.action(result));
            else onClick.callback.action(result);
          }
          if (onClick.tableAction) dispatch({ type: onClick.tableAction.action, ...onClick.tableAction.arguments });
        });
    } else if (!onClick.isTableDispatch) {
      rootDispatch(onClick.handler(...onClick.arguments));
      if (onClick.tableAction) dispatch({ type: onClick.tableAction.action, ...onClick.tableAction.arguments });
    } else if (onClick.isTableDispatch) {
      dispatch({ type: onClick.handler, ...onClick.arguments });
    } else {
      onClick.handler(...onClick.arguments);
    }
  };
  if (promptable) {
    const promptOptions = {
      onOk: async () => {
        action();
      },
      onCancel: () => toastr.removeByType("confirms"),
      okText: "Yes",
      cancelText: "No"
    };
    toastr.confirm(prompt, promptOptions);
  } else {
    action();
  }
};

const tablePropsInit = ({ isSelectable = false, columnReordering = true, rowReordering = false, csvExport = true, ...props }) => {
  let baseColumns = props.columns;
  if (rowReordering) baseColumns.unshift({ key: "drop", isDraggable: true, width: 50, isResizable: false, isReorderable: false });
  if (isSelectable) baseColumns.unshift({ key: "selection-cell", width: 50, isResizable: false, isReorderable: false });
  baseColumns = uniqBy(baseColumns, "key");
  const columns = baseColumns.map((col) => {
    if (!props.is_authorized && col.title === "Actions") return false;
    return {
      ...col,
      dataType: DataType[col.dataType],
      sortDirection: SortDirection[col.sortDirection] || null
    }
  }).filter((e) => e);
  return {
    account: props.account,
    data: [],
    groupedColumns: props.groupedColumns || [],
    columns,
    paging: {
      enabled: false,
      pageIndex: 0,
      pageSize: props.page_size,
      pageSizes: [10, 25, 50, 100],
      position: "topAndBottom"
    },
    search: ({ searchText, rowData, column }) => {
      if (column.dataType === "boolean" && column.labels && column.labels.length) {
        return (searchText === (rowData[column.labels[1]] || column.labels[1]) && !rowData[column.key]) || (searchText === (rowData[column.labels[0]] || column.labels[0]) && rowData[column.key]);
      }
    },
    ...(props.virtualScrolling && {
      virtualScrolling: {
        enabled: true
      }
    }),
    groups: props.groups,
    groupsExpanded: [],
    rowKeyField: props.rowKeyField || "id",
    searchText: null,
    columnResizing: props.columnResizing,
    editableCells: [],
    editingMode: EditingMode.Cell,
    width: "100%",
    columnReordering,
    rowReordering,
    csvExport,
    loading: {
      enabled: props.loading,
      text: "Fetching..."
    },
    sortingMode: SortingMode.Single
  }
};

const ColumnSettings = (tableProps) => {
  const columnsSettingsProps = {
    data: tableProps.columns.filter((c) => c.title).map((c) => ({ ...c, visible: c.visible !== false })),
    rowKeyField: "key",
    columns: [
      {
        key: "title",
        isEditable: false,
        title: "Field",
        style: { textAlign: "left" },
        dataType: DataType.String
      },
      {
        key: "visible",
        title: "Visible",
        isEditable: false,
        style: { textAlign: "right" },
        width: 125,
        dataType: DataType.Boolean
      }
    ],
    editingMode: EditingMode.None
  };
  const dispatchSettings = (action) => {
    if (action.type === ActionType.UpdateCellValue) {
      tableProps.dispatch(
        action.value
          ? showColumn(action.rowKeyValue)
          : hideColumn(action.rowKeyValue)
      );
    }
  };
  return (
    <TableMain>
      <Table
        {...columnsSettingsProps}
        childComponents={{
          rootDiv: {
            elementAttributes: () => ({
              className: `column_settings${tableProps.settingStatus ? " active" : ""}`
            })
          },
          cell: {
            content: props => {
              switch (props.column.key) {
                case "visible":
                  return <CellEditorBoolean {...props} />;
                default:
                  return;
              }
            }
          }
        }}
        dispatch={dispatchSettings}
      />
    </TableMain>
  );
};

const saveItem = (newItemConfig, updateNewItemField, rootDispatch) => {
  updateNewItemField({ ...newItemConfig, loading: true });
  let type = "new";
  let updates = newItemConfig.values;
  if (!isEmpty(newItemConfig.initial_values)) type = "update";
  rootDispatch(newItemConfig.action({ [newItemConfig.updateProp]: { type, value: updates, updated: !isEmpty(newItemConfig.initial_values) ? newItemConfig.initial_values : false } }, type))
    .then(() => {
      rootDispatch(showNotification("success", "Success", `Successfully ${type === "new" ? "created new" : "updated"} record`));
      updateNewItemField({ ...newItemConfig, isCreatingNewItem: false, values: {}, initial_values: {}, loading: false });
    })
    .catch((error) => {
      rootDispatch(showNotification("error", "Error", error.message));
    });
};

const checkFields = (config, store_data) => {
  const isUpdating = Object.keys(config.initial_values).length;
  const isUntouched = isEqual(config.initial_values, config.values);
  const isExisting = store_data.find((item) => isEqual(omit(item, "created_at"), config.values));
  if (isEmpty(config.values)) return false;
  if (isUpdating && isUntouched) return false;
  if (!isUpdating && isExisting) return false;
  return true;
};

const ReduxTableComponent = (props) => {
  let dragStart;
  let startIndex;
  const defaultFilter = { groupName: "and", items: [] };
  const filter = (props.filter || defaultFilter);
  const { radius = 8, transform_data, dragOrderKey = "id", getData, getArgs = [true], exportPDFFunction = null } = props;
  const rootDispatch = useDispatch();
  let initial_data = props.initial_data;
  const accounts = useSelector((state) => state.accounts);
  const session = useSelector((state) => state.session);
  const account = accounts.find((a) => a.account_id === session.account_id);
  const permissions = account.permissions;
  const is_authorized = props.permissions.every((p) => permissions.includes(p));
  const store_data = useSelector((state) => get(state, props.data_path.join(".")));
  const [tableProps, changeTableProps] = useState(tablePropsInit({ ...props, account, is_authorized, has_data: !!(initial_data.length || store_data.length) }));
  const [filterValue, changeFilter] = useState(filter);
  const [newItemConfig, updateNewItemField] = useState({ isCreatingNewItem: false, values: {}, initial_values: {}, loading: false });
  const [settingStatus, setSettingStatus] = useState(false);
  const [filterActive, toggleFilter] = useState(filterValue ? (!!filterValue.items.length || !!filter) : !!filter);
  const selectedData = kaPropsUtils.getSelectedData(tableProps);
  const can_refresh = (!props.requested && !props.loading);
  const dispatch = (action) => {
    switch(action.type) {
      case "ROW_DROP":
        const reOrdered = tableProps.data.map((t) => t[dragOrderKey]);
        const removedTarget = reOrdered.splice(action.startIndex, 1)[0];
        reOrdered.splice(action.endIndex, 0, removedTarget);
        if (props.orderUpdateFunction && props.draggableDataKey) {
          dispatch(showLoading("Updating..."))
          rootDispatch(props.orderUpdateFunction({ [props.draggableDataKey]: reOrdered }))
            .then(() => {
              dispatch(showLoading("Sorting..."))
              return rootDispatch(getData(...getArgs));
            }).then(() => dispatch(hideLoading()))
            .catch(() => dispatch(hideLoading()));
        }
        break;
      case "UpdateCellValue":
        if (props.cellUpdateFunction) {
          rootDispatch(props.cellUpdateFunction(action.rowData.id, { [action.columnKey]: action.value }))
            .then(() => rootDispatch(showNotification("success", "Updated", "Successfully updated record")))
            .then(() => dispatch(hideLoading()))
            .catch(() => dispatch(hideLoading()));
        }
        break;
      case "deleteItem":
        rootDispatch(showNotification("success", "Deleted", "Successfully deleted record"));
        if (props.orderUpdateFunction && props.draggableDataKey) {
          const reOrdered = tableProps.data.map((t) => t[dragOrderKey]);
          dispatch(showLoading("Updating..."))
          rootDispatch(props.orderUpdateFunction({ [props.draggableDataKey]: reOrdered }))
            .then(() => dispatch(hideLoading()))
            .catch(() => dispatch(hideLoading()));
        }
        break;
      case "openNewItemField":
        let defaults = { ...newItemConfig, ...action, isCreatingNewItem: true, loading: false };
        updateNewItemField(defaults);
        if (action.rowKeyValue) dispatch(hideDetailsRow(action.rowKeyValue));
        break;
      default:
        changeTableProps((prevState) => kaReducer(prevState, action));
    }
  };

  const deleteMultiple = async () => {
    const deleteMultiOptions = {
      onOk: async () => {
        dispatch(showLoading("Deleting..."));
        rootDispatch(props.deleteMultiple(selectedData.map((s) => s.id)))
          .then(() => {
            if (props.orderUpdateFunction && props.draggableDataKey) {
              const reOrdered = tableProps.data.map((t) => t[dragOrderKey]);
              dispatch(showLoading("Updating..."))
              rootDispatch(props.orderUpdateFunction({ [props.draggableDataKey]: reOrdered }))
                .then(() => dispatch(hideLoading()))
                .catch(() => dispatch(hideLoading()));
            }
            dispatch(hideLoading());
          })
          .catch(() => dispatch(hideLoading()));
      },
      onCancel: () => toastr.removeByType("confirms"),
      okText: "Delete",
      cancelText: "Cancel"
    };
    toastr.confirm(`Are you sure you want to delete ${selectedData.length} records?`, deleteMultiOptions);
  };
  
  const onFilterChanged = (newFilterValue) => {
    changeFilter(newFilterValue);
  };
  const fields = (props.fields || []).map((field) => {
    const type_ops = operators[field.type];
    return { ...field, operators: type_ops };
  });

  useEffect(() => {
    if (can_refresh) {
      let args = getArgs;
      args.shift();
      rootDispatch(getData(false, ...args));
    };
  }, [can_refresh, getArgs, getData, rootDispatch]);

  useEffect(() => {
    if (!filterValue.items.length) {
      toggleFilter(false);
    };
  }, [filterValue.items.length]);

  useEffect(() => {
    return () => {
      onFilterChanged({ groupName: "and", items: [] });
      toggleFilter(false);
    }
  }, []);

  useEffect(() => {
    changeTableProps((prevProps) => ({ ...prevProps, loading: { enabled: props.loading, text: "Fetching..." }}));
  }, [props.loading]);

  useEffect(() => {
    let data = (initial_data.length ? initial_data : store_data);
    if (transform_data) data = transform_data(data);
    changeTableProps((prevState) => ({ ...prevState, data }));
  }, [store_data, initial_data, transform_data]);

  const filtered = filterData(tableProps.data, filterValue);
  const visibleData = kaPropsUtils.getData({ ...tableProps, data: filtered, paging: { ...tableProps.paging, pagesCount: Math.ceil((filtered.length / tableProps.paging.pageSize)) } });
  const pages = kaPropsUtils.getPagesCountByProps({ ...tableProps, data: filtered });

  useEffect(() => {
    let paging = tableProps.paging.enabled;
    if (tableProps.data.length && !props.widget) paging = true;
    else paging = false;
    changeTableProps((prevState) => ({ ...prevState, paging: { ...prevState.paging, enabled: paging } }));
  }, [tableProps.data.length, tableProps.paging.enabled, props.widget]);

  const updateRowData = (row) => {
    const current_rows = tableProps.data.filter((r) => r.id !== row.id);
    if (row) tableProps.data = [...current_rows, row];
  };
  return (
    <TableMain width={props.width}>
      {props.header
        ? (
          <TableHeader>
            <TableHeaderPadding>
              <TableHeaderInner radius={radius}>
                <TableHeaderInnerText widget={props.widget}>{props.header}</TableHeaderInnerText>
                {!props.widget
                  ? (
                    <TableHeaderInnerIcon onClick={() => setSettingStatus(!settingStatus)}>
                      <FontAwesomeIcon icon={["fas", (settingStatus ? "times" : "cog")]} />
                    </TableHeaderInnerIcon>
                  )
                  : null
                }
                {!props.widget && !tableProps.data.length
                  ? (
                    <TableHeaderInnerIcon onClick={() => {
                      rootDispatch(getData(...getArgs));
                      if (props.onRefresh) props.onRefresh();
                    }}>
                      <FontAwesomeIcon icon={["fas", "arrows-rotate"]} style={{ marginLeft: "10px" }} spin={tableProps.loading.enabled}/>
                    </TableHeaderInnerIcon>
                  )
                  : null
                }
              </TableHeaderInner>
            </TableHeaderPadding>
          </TableHeader>
        )
        : null
      }
      {!props.widget
        ? <ColumnSettings {...tableProps} dispatch={dispatch} settingStatus={settingStatus} />
        : null
      }
      {fields.length && tableProps.data.length
        ? (
          <FilterContainer>
            <FilterContainerPadding>
              <FilterContainerInner>
                {filterActive && filterValue.items.length >= 1
                  ? <FilterHeader onClick={() => {
                    onFilterChanged(defaultFilter);
                  }}>Clear Filter</FilterHeader>
                  : <FilterHeader onClick={() => toggleFilter(!filterActive)}>Advanced Filter</FilterHeader>
                }
                {filterActive
                  ? <FilterControl {...{ fields, groups, filterValue, onFilterValueChanged: onFilterChanged }} />
                  : null
                }
              </FilterContainerInner>
            </FilterContainerPadding>
          </FilterContainer>
        )
        : null
      }
      {props.search && tableProps.data.length
        ? (
          <SearchContainer>
            <SearchContainerPadding>
              <SearchContainerInner>
                <SearchContainerSection align="left" xs={6} sm={6} md={10} lg={10} xl={10}>
                  <SearchInputWrapper>
                    <SearchInput type="search" value={tableProps.searchText || ""} onChange={(event) => dispatch(search(event.currentTarget.value))} placeholder="Start typing to search..." />
                  </SearchInputWrapper>
                </SearchContainerSection>
                <SearchContainerSection widget={props.widget ? 1 : 0} align="right" xs={6} sm={6} md={2} lg={2} xl={2}>
                  <SearchButtonWrapper>
                    {tableProps.searchText || tableProps.paging.pageIndex > 0 || (filterActive && filterValue.items.length) || !!initial_data.length
                      ? <TableButton small={props.widget ? 1 : 0} secondary blue onClick={() => {
                        onFilterChanged(defaultFilter);
                        dispatch(search(""));
                        dispatch(updatePageIndex(0))
                        if (props.clearDefaults) props.clearDefaults();
                      }}>Clear</TableButton>
                      : <TableButton small={props.widget ? 1 : 0} secondary blue onClick={() => {
                        rootDispatch(getData(...getArgs));
                        if (props.onRefresh) props.onRefresh();
                      }}>{tableProps.loading.enabled ? <FontAwesomeIcon icon={["fal", "spinner"]} spin /> : "Refresh"}</TableButton>
                    }
                  </SearchButtonWrapper>
                </SearchContainerSection>
              </SearchContainerInner>
            </SearchContainerPadding>
          </SearchContainer>
        )
        : null
      }
      <PaginationMain>
        <PaginationContainer padding={props.widget ? 1 : "0 20px 20px 20"}>
          <PaginationSection xs={12} sm={12} md={3} lg={3} xl={3} align="left">
          {tableProps.data.length
            ? (
              <>
                {!props.widget
                  ? (
                    <>
                      <TableText>
                        {props.paging && pages
                          ? `Page ${(tableProps.paging.pageIndex >= 1 ? tableProps.paging.pageIndex + 1 : 1)} of ${pages}`
                          : null
                        }
                      </TableText>
                      <TableText>
                        {tableProps.searchText || (filterActive && filterValue.items.length && filterValue.items[0].value)
                          ? `${visibleData.length.toLocaleString()} ${visibleData.length === 1 ? "result" : "results"}`
                          : `${visibleData.length.toLocaleString()} records`
                        }
                      </TableText>
                      {selectedData.length
                        ? (
                          <TableText>
                            {`${selectedData.length} ${(selectedData.length === 1) ? "row" : "rows"} selected`}
                          </TableText>
                        )
                        : null
                      }
                      {props.additional_info
                        ? <TableText>{props.additional_info}</TableText>
                        : null
                      }
                      {tableProps.csvExport
                        ? (
                          <TableText>
                            <CSVLink
                              className="export-csv-button"
                              data={kaPropsUtils.getData({ ...tableProps, data: filtered ? filtered : tableProps.data, paging: { ...tableProps.paging, pageSize: tableProps.data.length } })}
                              headers={tableProps.columns.map(c => (c.title && !["Actions"].includes(c.title)) ? ({ label: c.title, key: c.key }) : false).filter((e) => e)}
                              filename="output.csv"
                              enclosingCharacter={''}
                              separator={","}>
                              Export CSV
                            </CSVLink>
                          </TableText>
                        )
                        : null
                      }
                    </>
                  )
                  : null
                }
              </>
            )
            : null
          }
          </PaginationSection>
          <PaginationSection xs={12} sm={12} md={9} lg={9} xl={9} align="right">
            {is_authorized
              ? (
                <>
                  {props.newRow
                    ? (
                      <>
                        <NewItemWrapper margintop={!tableProps.data.length ? 20 : 0}>
                          {newItemConfig.isCreatingNewItem
                            ? (
                              <NewItemFieldWrapper>
                                <NewItemFieldWrapperPadding>
                                  <NewItemFieldWrapperInner>
                                    {props.newRow.fields
                                      ? (
                                        <FieldWrapperFields>
                                          {props.newRow.fields.filter((field) => field.show ? field.show(newItemConfig) : field).map((field, index) => {
                                            if (!newItemConfig.values[field.name] && field.value) updateNewItemField({ ...newItemConfig, values: { ...newItemConfig.values, [field.name]: field.value } })
                                            switch (field.type) {
                                              case "component":
                                                const Component = field.Component(index, newItemConfig, updateNewItemField, NewItemFieldInput);
                                                return Component;
                                              default:
                                                return <NewItemFieldInput autoComplete="off" style={field.style} width={field.width} key={index} autoFocus={index === 0} type={field.type} name={field.name} placeholder={field.placeholder} value={(newItemConfig.values[field.name] || field.value || "")} onChange={(event) => updateNewItemField({ ...newItemConfig, values: { ...newItemConfig.values, [field.name]: event.target.value } })} />;
                                            }
                                          })}
                                        </FieldWrapperFields>
                                      )
                                      : null
                                    }
                                    <TableButton small={props.widget ? 1 : 0} disabled={!checkFields(newItemConfig, store_data) || !props.newRow.fields.every((f) => f.condition(newItemConfig.values[f.name], newItemConfig))} nomargin marginleft={10} green onClick={() => saveItem(newItemConfig, updateNewItemField, rootDispatch)}>{newItemConfig.loading ? <FontAwesomeIcon icon={["fas", "spinner"]} spin /> : "Save"}</TableButton>
                                    <TableButton small={props.widget ? 1 : 0} nomargin marginleft={10} danger onClick={() => updateNewItemField({ ...newItemConfig, isCreatingNewItem: false, values: {} })}>Cancel</TableButton>
                                  </NewItemFieldWrapperInner>
                                </NewItemFieldWrapperPadding>
                              </NewItemFieldWrapper>
                            )
                            : null
                          }
                        </NewItemWrapper>
                        {!newItemConfig.isCreatingNewItem
                          ? <TableButton small={props.widget ? 1 : 0} nomargin marginleft={10} blue onClick={() => (!props.newRow.isTableDispatch ? rootDispatch(props.newRow.onClick(...props.newRow.arguments)) : dispatch({ type: props.newRow.onClick, ...props.newRow.arguments }))}>{props.newRow.buttonText || "New"}</TableButton>
                          : null
                        }
                      </>
                    )
                    : null
                  }
                  {selectedData.length && props.deleteMultiple
                    ? <TableButton small={props.widget ? 1 : 0} nomargin marginleft={10} danger onClick={() => deleteMultiple(selectedData.map((s) => s.id), props.deleteMultiple)}>{`Delete ${selectedData.length} ${(selectedData.length === 1) ? "Row" : "Rows"}`}</TableButton>
                    : null
                  }
                </>
              )
              : null
            }
            {!newItemConfig.isCreatingNewItem
              ? (
                <>
                  {exportPDFFunction
                    ? <TableButton small={props.widget ? 1 : 0} nomargin marginleft={10} blue onClick={() => rootDispatch(exportPDFFunction((filtered ? filtered : tableProps.data), tableProps.searchText))}>Export PDF</TableButton>
                    : null
                  }
                  {props.additionalButton && is_authorized
                    ? (
                      <>
                        {!props.additionalButton.Component
                          ? <TableButton small={props.widget ? 1 : 0} nomargin marginleft={10} blue onClick={() => rootDispatch(props.additionalButton.onClick(...props.additionalButton.arguments))}>{props.additionalButton.buttonText}</TableButton>
                          : props.additionalButton.Component(props)
                        }
                      </>
                    )
                    : null
                  }
                  {tableProps.paging.pageIndex >= 1
                    ? <TableButton small={props.widget ? 1 : 0} nomargin marginleft={10} blue onClick={() => dispatch(updatePageIndex(Number(tableProps.paging.pageIndex - 1)))}>Previous Page</TableButton>
                    : null
                  }
                  {((tableProps.paging.pageIndex + 1) <= Math.ceil((tableProps.data.length / tableProps.paging.pageSize))) && tableProps.data.length && pages > 1
                    ? <TableButton small={props.widget ? 1 : 0} nomargin marginleft={10} blue onClick={() => dispatch(updatePageIndex(Number(tableProps.paging.pageIndex + 1)))}>Next Page</TableButton>
                    : null
                  }
                </>
              )
              : null
            }
          </PaginationSection>
        </PaginationContainer>
      </PaginationMain>
      <Table
        {...tableProps}
        extendedFilter={() => filtered}
        childComponents={{
          ...(props.virtualScrolling && {
            tableWrapper: {
              elementAttributes: () => ({ style: { maxHeight: 600 } })
            }
          }),
          ...(props.subscribe ? {
            dataRow: {
              content: (p) => <CustomRow key={p.rowData.id} {...p} updateRowData={updateRowData} />
            }
          } : {
            dataRow: {
              elementAttributes: (dataRowProps) => {
                return ({
                  ...(props.rowReordering && {
                    onDragStartCapture: () => {
                      startIndex = findIndex(tableProps.data, (o) => isEqual(o.id, dataRowProps.rowData.id));
                      dragStart = dataRowProps.rowData[dragOrderKey];
                    },
                    onDropCapture: () => {
                      const endIndex = findIndex(tableProps.data, (o) => isEqual(o.id, dataRowProps.rowData.id));
                      dispatch({ type: "ROW_DROP", startKey: dragStart, endKey: dataRowProps.rowData[dragOrderKey], startIndex, endIndex })
                    }
                  }),
                  ...(props.dataRowAttributes && props.dataRowAttributes(dataRowProps.rowData))
                })
              }
            }
          }),
          headCell: {
            content: (props) => {
              if (props.column.key === "selection-cell") {
                return (
                  <SelectionHeader {...props}
                    areAllRowsSelected={kaPropsUtils.areAllFilteredRowsSelected(tableProps)}
                  // areAllRowsSelected={kaPropsUtils.areAllVisibleRowsSelected(tableProps)}
                  />
                );
              }
            },
            elementAttributes: (props) => {
              if (props.column.sticky) {
                return {
                  style: {
                    ...props.column.style,
                    position: "sticky",
                    left: 0,
                    zIndex: 10,
                  }
                }
              }
            }
          },
          headCellContent: {
            content: ({ column }) => {
              const { isReorderable = true } = column;
              return (
                <>
                  {isReorderable && tableProps.columnReordering
                    ? <FontAwesomeIcon icon={["fas", "grip-vertical"]} style={{ cursor: "move", marginRight: "10px" }} />
                    : null
                  }
                  <span>{column.title}</span>
                </>
              );
            }
          },
          cell: {
            elementAttributes: ({ column }) => {
              return ({
                className: (column.isEditable && is_authorized) ? "editable" : "ka-cell",
                "data-column": column.mobile_title || column.title,
                ...(column.sticky && {
                  style: {
                    ...column.style,
                    position: "sticky",
                    left: 0,
                    backgroundColor: "#eee",
                  }
                })
              });
            }
          },
          noDataRow: {
            content: () => "No Data Found"
          },
          detailsRow: {
            content: (detailsRowProps) => DetailsRow({ ...detailsRowProps, account })
          },
          groupCell: {
            content: (groupProps) => GroupCell(groupProps, tableProps, dispatch)
          },
          cellEditor: {
            content: (props) => {
              const { isEditable = false, editorType = "text" } = props.column;
              if (isEditable && is_authorized) {
                switch (editorType) {
                  case "text": return <CustomCellEditor {...props} />;
                  case "date": return <CustomCellEditor {...props} />;
                  case "select": return <CustomCellSelect {...props} />;
                  default: return <CustomCellEditor {...props} />;
                }
              }
              return null;
            }
          },
          cellText: {
            content: (cellProps) => {
              const column = cellProps.column;
              let empty_value = "N/A";
              if (!column.Component) {
                let val = cellProps.value;
                if (column.dataType === DataType.Date) {
                  if (column.format) {
                    val = column.format(val, cellProps.rowData);
                  } else {
                    val = val ? val.toLocaleDateString("en", { month: "2-digit", day: "2-digit", year: "numeric" }) : null;
                  }
                  if (column.isEditable && is_authorized) val = <Cell bold={true} style={{ cursor: "pointer" }}><FontAwesomeIcon icon={["fad", "calendar-lines-pen"]} color={theme.hopeTrustBlue} style={{ marginRight: "5px" }} /> {val}</Cell>;
                } else if (column.dataType === DataType.Number) {
                  if (column.is_currency) {
                    empty_value = `$${0}`;
                    val = (val ? `$${(val / 100).toLocaleString()}` : "$0");
                  } else {
                    empty_value = 0;
                    if (column.format) {
                      val = column.format(val, cellProps.rowData);
                    } else {
                      val = (val ? val : 0);
                    }
                  }
                } else if (column.dataType === DataType.String) {
                  if (column.format) {
                    val = column.format(val, cellProps.rowData);
                  } else {
                    val = (val ? (column.uppercase ? val.toUpperCase() : val) : null);
                  }
                  if (column.isEditable && is_authorized) val = <Cell capitalize={column.capitalize ? 1 : 0} bold={true} style={{ cursor: "pointer" }}><FontAwesomeIcon icon={["fad", "pen"]} color={theme.hopeTrustBlue} style={{marginRight: "5px"}}/> {val}</Cell>;
                } else if (column.dataType === DataType.Boolean) {
                  if (column.format) {
                    val = column.format(val, cellProps.rowData);
                  } else {
                    if (column.labels && column.labels(cellProps.rowData).length) val = val ? (cellProps.rowData[column.labels(cellProps.rowData)[0]] || column.labels(cellProps.rowData)[0]) : (cellProps.rowData[column.labels(cellProps.rowData)[1]] || column.labels(cellProps.rowData)[1]);
                  }
                } else {
                  empty_value = 0;
                  if (cellProps.column.isDraggable && props.rowReordering) return <FontAwesomeIcon icon={["fas", "grip-vertical"]} style={{ cursor: "move", marginRight: "10px" }} />;
                  if (cellProps.column.key === "show-hide-details-row") return <DetailsButton {...{ ...cellProps, account, is_authorized }} />;
                  if (cellProps.column.key === "selection-cell" && props.isSelectable) return <SelectionCell {...cellProps} />;
                }
                if (typeof val !== "object") return <Cell capitalize={column.capitalize ? 1 : 0} bold={((column.filter && val) || (column.onClick && val)) ? 1 : 0} sortable={(column.sortable && val) ? 1 : 0}>{val || empty_value} {column.filter && val ? <FontAwesomeIcon icon={["fas", "arrow-alt-circle-right"]} /> : null}</Cell>;
                return val || empty_value;
              } else if (column.Component) {
                const Component = column.Component(cellProps.rowData);
                return <Component.Custom {...Component.props} />
              }
            },
            elementAttributes: () => ({
              onClick: (e, extendedEvent) => {
                const data = extendedEvent.childProps;
                if (!data.column.isEditable) {
                  let value = data.rowData[data.field];
                  if (data.column.sortable) {
                    let currentFilter = filterValue;
                    let currentFilterItems = currentFilter.items;
                    if (data.column.dataType === "boolean") {
                      value = value.toString();
                    }
                    const fieldExists = fields.find((field) => field.name === data.column.key);
                    const filterExists = currentFilterItems.find((f) => f.field === data.column.key && f.value === (["date"].includes(fieldExists.type) ? moment(value).format("YYYY-MM-DD") : value));
                    if (!filterExists && fieldExists) {
                      currentFilterItems.push({
                        field: data.column.key,
                        key: `${data.column.key}_${currentFilterItems.length + 1}`,
                        operator: ["date"].includes(fieldExists.type) ? "dateEquals" : "=",
                        value: ["date"].includes(fieldExists.type) ? moment(value).format("YYYY-MM-DD") : value,
                      });
                      currentFilter.items = currentFilterItems;
                    } else if (!fieldExists) {
                      if (data.column.dataType === "boolean") {
                        value = (value ? (data.rowData[data.column.labels(data.rowData)[0]] || data.column.labels(data.rowData)[0]) : (data.rowData[data.column.labels(data.rowData)[1]] || data.column.labels(data.rowData)[1]))
                      }
                      dispatch(search(value))
                    }
                    if (currentFilter.items.length) {
                      changeFilter({ ...currentFilter });
                      if (!filterActive) toggleFilter(true);
                    }
                  }
                  if (data.column.filter) data.column.filter(data.rowData, rootDispatch);
                  if (data.column.onClick && value) data.column.onClick(value, data.rowData, rootDispatch);
                } else if (data.column.isEditable && is_authorized) {
                  dispatch(resizeColumn(data.column.key, 325));
                  extendedEvent.baseFunc();
                }
              }
            })
          }
        }}
        dispatch={dispatch}
      />
    </TableMain>
  );
};

const GenericTable = (props) => <ReduxTableComponent {...props} />;

export default GenericTable;