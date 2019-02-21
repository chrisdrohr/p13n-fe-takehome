const logVisibility = (id, area) => {
  switch (area) {
    case 'top':
      console.log(
        `%c Column with id: ${id} started to become visible on the page`,
        'color: green; font-size: 16px'
      );
      break;
    case 'center':
      console.log(
        `%c Column with id: ${id} is now more than 50% visible on the page`,
        'color: orange; font-size: 16px'
      );
      break;
    case 'bottom':
      console.log(
        `%c Column with id: ${id} is now fully visible on the page`,
        'color: red; font-size: 16px'
      );
      break;
    default:
      null;
  }
};
const observeColumnsWithIntersectionObserver = () => {
  const columns = document.getElementsByClassName('column');
  // Options for Intersection Observer
  const options = {
    threshold: [0.0, 0.5, 1.0]
  };
  const columnVisibility = {};
  // Intersection Observer callback
  const callback = (entries, observer) => {
    for (entry of entries) {
      entry.visible = { top: false, center: false, bottom: false };
      const { intersectionRatio, isIntersecting, target, visible } = entry;
      if (isIntersecting) {
        const topVisible =
          intersectionRatio >= options.threshold[0] &&
          intersectionRatio < options.threshold[1];
        const centerVisible =
          intersectionRatio >= options.threshold[1] &&
          intersectionRatio < options.threshold[2];
        const bottomVisible = intersectionRatio >= options.threshold[2];

        if (topVisible && !columnVisibility[target.id].top) {
          columnVisibility[target.id].top = true;
          logVisibility(target.id, 'top');
        }

        if (centerVisible && !columnVisibility[target.id].center) {
          columnVisibility[target.id].center = true;
          logVisibility(target.id, 'center');
        }

        if (bottomVisible && !columnVisibility[target.id].bottom) {
          columnVisibility[target.id].bottom = true;
          logVisibility(target.id, 'bottom');

          // Unobserve column when completely visible
          observer.unobserve(target);
        }
      }
    }
  };

  const observer = new IntersectionObserver(callback, options);
  // Observe each column
  for (let column of columns) {
    columnVisibility[column.id] = { top: false, center: false, bottom: false };
    observer.observe(column);
  }
};
const observeColumnsWithScrollListener = () => {
  const columns = document.getElementsByClassName('column');
  const elements = [];
  let windowHeight = window.innerHeight;
  const calcDimensions = () => {
    if (elements.length > 0) {
      elements.splice(0, elements.length);
    }
    for (let column of columns) {
      const dimensions = column.getBoundingClientRect();
      // Filter out columns with no height
      if (dimensions.height > 0) {
        elements.push({
          column,
          dimensions,
          visible: { top: false, center: false, bottom: false }
        });
      }
    }
  };

  const onScroll = () => {
    requestAnimationFrame(() => {
      const pos = window.scrollY + windowHeight;
      for (let element of elements) {
        const {
          column: { id },
          dimensions: { bottom, height, top },
          visible
        } = element;

        const topVisible = pos >= top && pos <= top + height / 2;
        const centerVisible = pos >= top && pos >= top + height / 2;
        const bottomVisible = pos >= bottom;

        if (topVisible && !visible.top) {
          visible.top = true;
          logVisibility(id, 'top');
        }

        if (centerVisible && !visible.center) {
          visible.center = true;
          logVisibility(id, 'center');
        }

        if (bottomVisible && !visible.bottom) {
          visible.bottom = true;
          logVisibility(id, 'bottom');

          // Remove node when completely visible
          elements.splice(elements.indexOf(element), 1);
        }
      }
    });
  };
  calcDimensions();
  // Recalculate column dimensions and window height on window resize
  window.addEventListener('resize', () => {
    calcDimensions();
    windowHeight = window.innerHeight;
  });
  window.addEventListener('scroll', onScroll);
};
if ('IntersectionObserver' in window) {
  observeColumnsWithIntersectionObserver();
} else {
  observeColumnsWithScrollListener();
}
