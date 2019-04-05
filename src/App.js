import React, { Component, useRef } from 'react';
import { convertFromRaw, AtomicBlockUtils, Editor, EditorState } from 'draft-js';
import './App.css';
import CanvasDraw from "react-canvas-draw";

const rawContent = {
  blocks: [{
    text: "I'm just a doc you can edit me.",
  }, {
    text: "But you can also draw!!!",
  }, {
    type: 'atomic',
    text: ' ',
    entityRanges: [{
      key: '1',
      offset: 0,
    }]
  }, {
    text: 'Press the button in the top right to insert a new sticky note'
  }],
  entityMap: {
    '1': {
      type: 'CANVAS',
      mutability: 'IMMUTABLE',
      data: {
        content: ''
      }
    }
  }
};

const CanvasBlock = ({ contentState, block, blockProps: { onSave, content }, ...rest }) => {
  const canvas = useRef(null);

  return <div
    className="canvas-container"
    onMouseUp={() => {
      const entity = block.getEntityAt(0);
      onSave(contentState.replaceEntityData(entity, { content: canvas.current.getSaveData() }))
    }}
  >
    <CanvasDraw
      canvasWidth={350}
      canvasHeight={300}
      saveData={content}
      ref={canvas}
    />
  </div>
}

class App extends Component {
  state = {
    editorState: EditorState.createWithContent(convertFromRaw(rawContent))
  }

  onChange = editorState => {
    this.setState({ editorState })
  }

  insertCanvas = () => {
    const { editorState } = this.state;
    let content = editorState.getCurrentContent();

    content = content.createEntity(
      'CANVAS',
      'IMMUTABLE',
      { content: '' }
    )

    const entityKey = content.getLastCreatedEntityKey();

    this.setState({
      editorState: AtomicBlockUtils.insertAtomicBlock(
        editorState,
        entityKey,
        ' ',
      ),
    });
  }

  saveCanvas = (content) => {
    this.setState({
      editorState: EditorState.push(
        this.state.editorState,
        content
      )
    });
  }

  blockRendererFn = block => {
    const { editorState } = this.state;
    const content = editorState.getCurrentContent();

    if (block.getType() === 'atomic') {
      const entityKey = block.getEntityAt(0);
      const entity = content.getEntity(entityKey);
      const entityData = entity.getData() || { content: '' }
      if (entity != null && entity.getType() === 'CANVAS') {
        return {
          component: CanvasBlock,
          props: {
            onSave: this.saveCanvas,
            ...entityData
          }
        }
      }
    }
  }

  render() {
    return (
      <div className="App">
        <button onClick={this.insertCanvas}>&#10000;</button>
        <Editor
          onChange={this.onChange}
          stripPastedStyles
          blockRendererFn={this.blockRendererFn}
          handlePastedText={this.handlePastedText}
          editorState={this.state.editorState}
        />
      </div>
    );
  }
}

export default App;
