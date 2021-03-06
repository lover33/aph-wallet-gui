<template>
  <section id="assets-table">
    <div class="search-field">
      <aph-icon name="search"></aph-icon>
      <input placeholder="Search" v-model="searchBy">
    </div>
    <button class="add-token-btn" v-if="shouldShowAddTokenButton" @click="showAddTokenModal">Add token</button>
    <div class="holdings">
      <div v-for="(holding, index) in filteredHoldings" class="holding" :key="index">
        <aph-token-icon :symbol="holding.symbol"></aph-token-icon>
        <div class="left">
          <div class="currency">{{ holding.name }}</div>
          <div class="meta">
            <div class="symbol">{{ holding.symbol }}</div>
            <div :class="['change', {decrease: holding.change24hrPercent < 0, increase: holding.change24hrPercent > 0}]">{{ $formatNumber(holding.change24hrPercent) }}</div>
          </div>
        </div>
        <div class="remove-link" v-if="holding.canRemove" @click="remove(holding)">Remove</div>
        <div class="right">
          <div class="amount">{{ $formatNumber(holding.balance) }} {{ holding.symbol }}</div>
          <div class="value">{{ $formatMoney(holding.unitValue) }} {{ $store.state.currency }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
let loadHoldingsIntervalId;
export default {
  computed: {
    filteredHoldings() {
      const searchBy = this.searchBy.toLowerCase();
      return _.filter(this.$store.state.holdings, ({ name, symbol }) => {
        if (!name || !symbol) {
          return false;
        }

        return name.toLowerCase().indexOf(searchBy) > -1
          || symbol.toLowerCase().indexOf(searchBy) > -1;
      }).map((holding) => {
        const canRemove = holding.isCustom === true && holding.symbol !== 'APH';
        return _.merge(holding, {
          canRemove,
        });
      });
    },

    shouldShowAddTokenButton() {
      return this.$store.state.holdings.length === 0 && this.$isDone('fetchHoldings');
    },
  },

  data() {
    return {
      searchBy: '',
    };
  },

  methods: {
    loadHoldings() {
      this.$store.dispatch('fetchHoldings');
    },

    remove(holding) {
      this.$services.tokens.remove(holding.asset, this.$store.state.currentNetwork.net);
      this.$services.alerts.success(`Removed ${holding.symbol}`);
      this.loadHoldings();
    },

    showAddTokenModal() {
      this.$store.commit('setShowAddTokenModal', true);
    },
  },

  mounted() {
    this.loadHoldings();

    loadHoldingsIntervalId = setInterval(() => {
      this.loadHoldings();
    }, this.$constants.intervals.POLLING);
  },

  beforeDestroy() {
    clearInterval(loadHoldingsIntervalId);
  },
};
</script>

<style lang="scss">
#assets-table {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;

  .search-field {
    border-bottom: $border;
    border-color: $grey;
    display: flex;
    flex: none;
    margin: 0 $space $space-lg 0;
    padding: $space-sm 0;

    .aph-icon {
      flex: none;
      margin: 0 $space;

      svg {
        height: toRem(40px);

        .fill {
          fill: $purple;
        }
      }
    }

    input {
      background: none;
      border: none;
      color: $dark;
      font-family: GilroySemibold;
      font-size: toRem(15px);
      outline: none;
      padding: 0;
      width: 100%;

      &::placeholder {
        color: $grey;
      }
    }
  }

  .add-token-btn {
    @extend %btn-outline;

    color: $purple;
    margin-right: $space;
  }

  .holdings {
    flex: 1;
    overflow: auto;
    height: 80%;
    padding: 0 $space 0 0;

    .holding {
      align-items: center;
      background: white;
      border-radius: $border-radius;
      display: flex;
      padding: $space;

      .aph-token-icon {
        flex: none;
        margin-right: $space;

        .placeholder, img {
          height: toRem(60px);
          width: toRem(60px);
        }
      }

      .left {
        flex: 1;

        .currency {
          font-family: GilroySemibold;
          font-size: toRem(18px);
        }

        .meta {
          display: flex;
          margin-top: $space-sm;

          .symbol {
            @extend %small-uppercase-grey-label;
          }

          .change {
            font-family: GilroySemibold;
            font-size: toRem(12px);
            margin-left: $space;

            &.decrease {
              color: $red;
            }

            &.increase {
              color: $green;

              &:before {
                content: "+";
              }
            }
          }
        }
      }

      .remove-link {
        color: $grey;
        cursor: pointer;
        flex: none;
        font-family: GilroyMedium;
        opacity: 0;
        transition: $transition;
        visibility: hidden;

        &:hover {
          color: $purple;
        }
      }
      &:hover {
        .remove-link {
          opacity: 1;
          visibility: visible;
        }
      }

      .right {
        flex: 1;
        text-align: right;

        .amount {
          font-size: toRem(20px);
        }

        .value {
            @extend %small-uppercase-grey-label;

            margin-top: $space-sm;
        }
      }

      & + .holding {
        margin-top: $space-lg;
      }
    }
  }
}
</style>


