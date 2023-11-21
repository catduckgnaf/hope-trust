import React, { Component } from "react";
import { Button } from "../../global-components";
import {
  PaginationMain,
  PaginationContainer,
  PaginationSection
} from "./style";

class Pagination extends Component {

  render() {
    const { page, page_size, items, paginate, padding } = this.props;
    const total_pages = ((items.length / page_size) >= 1) ? Math.ceil(items.length / page_size) : 1;
    const previous_page = ((page - 1) > 0) ? (page - 1) : 1;
    const next_page = ((page + 1) <= total_pages) ? (page + 1) : total_pages;
    return (
      <PaginationMain>
        <PaginationContainer padding={padding}>
          <PaginationSection xs={12} sm={12} md={6} lg={6} xl={6} align="left">
            {items.length
              ? `Showing page ${page} of ${total_pages}`
              : null
            }
          </PaginationSection>
          <PaginationSection xs={12} sm={12} md={6} lg={6} xl={6} align="right">
            {page > 1
              ? <Button nomargin blue onClick={() => paginate(previous_page)}>Previous Page</Button>
              : null
            }
            {(page < total_pages) && items.length
              ? <Button nomargin marginleft={10} blue onClick={() => paginate(next_page)}>Next Page</Button>
              : <Button disabled nomargin marginleft={10} blue>Next Page</Button>
            }
          </PaginationSection>
        </PaginationContainer>
      </PaginationMain>
    );
  }
}

export default Pagination;
