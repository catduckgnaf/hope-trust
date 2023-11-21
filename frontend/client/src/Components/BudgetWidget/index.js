import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import Container from "../../Components/Container";
import { Pie } from "react-chartjs-2";
import {
  BudgetContainer,
  BudgetGraph,
  BudgetGraphTotal,
  BudgetGraphBubbles,
  BudgetBubbleRow,
  BudgetBubbleItem,
  BudgetBubble,
  BudgetBubbleLabel,
  Light,
  Dark
} from "./style";

class BudgetWidget extends Component {

  constructor(props) {
    super(props);
    
    const options = {
      responsive: false,
      cutoutPercentage: 0,
      animation: {
        animateRotate: false,
        animateScale: false
      },
      maintainAspectRatio: true,
      legend: {
        display: false
      }
    };

    const data = {
      value: 90,
      appendage: "mil",
      labels: ["Red", "Green", "Yellow"],
      datasets: [{
        data: [300, 50, 100],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
        hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"]
      }]
    };
    this.state = {
      data,
      options
    };
  }

  render() {
    const { data, options } = this.state;
    return (
      <Container title="Budget" xs={12} sm={12} md={12} lg={8} xl={8} height={302}>
        <BudgetContainer>
          <BudgetGraph>
            <Pie options={options} data={data} height={175} width={175} />
            <BudgetGraphTotal><Light>$3,650</Light><Dark>/$4,550</Dark></BudgetGraphTotal>
          </BudgetGraph>
          <BudgetGraphBubbles>

            <BudgetBubbleRow>
              <BudgetBubbleItem>
                <BudgetBubble>$1000</BudgetBubble> <BudgetBubbleLabel>Rent</BudgetBubbleLabel>
              </BudgetBubbleItem>
              <BudgetBubbleItem>
                <BudgetBubble>$100</BudgetBubble> <BudgetBubbleLabel>Food</BudgetBubbleLabel>
              </BudgetBubbleItem>
            </BudgetBubbleRow>

            <BudgetBubbleRow>
              <BudgetBubbleItem>
                <BudgetBubble>$250</BudgetBubble> <BudgetBubbleLabel>Transportation</BudgetBubbleLabel>
              </BudgetBubbleItem>
              <BudgetBubbleItem>
                <BudgetBubble>$650</BudgetBubble> <BudgetBubbleLabel>Utilities</BudgetBubbleLabel>
              </BudgetBubbleItem>
            </BudgetBubbleRow>

            <BudgetBubbleRow>
              <BudgetBubbleItem>
                <BudgetBubble>$400</BudgetBubble> <BudgetBubbleLabel>Medical</BudgetBubbleLabel>
              </BudgetBubbleItem>
              <BudgetBubbleItem>
                <BudgetBubble>$75</BudgetBubble> <BudgetBubbleLabel>Other</BudgetBubbleLabel>
              </BudgetBubbleItem>
            </BudgetBubbleRow>

          </BudgetGraphBubbles>
        </BudgetContainer>
      </Container>
    );
  }
}

const mapStateToProps = (state) => ({});
const dispatchToProps = (dispatch) => ({});
export default connect(mapStateToProps, dispatchToProps)(BudgetWidget);
