import React, { Component, useRef } from 'react';
import { AtomicBlockUtils, Editor, EditorState } from 'draft-js'
import CanvasDraw from "react-canvas-draw";

const CanvasBlock = ({ contentState, block, blockProps: { onSave, content }, ...rest }) => {
  const canvas = useRef(null);

  return <div
    onMouseUp={() => {
      const entity = block.getEntityAt(0);
      onSave(contentState.replaceEntityData(entity, { content: canvas.current.getSaveData() }))
    }}
  >
    <CanvasDraw
      saveData={content}
      ref={canvas}
    />
  </div>
}

class App extends Component {
  state = {
    editorState: EditorState.createEmpty()
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
        <button onClick={this.insertCanvas}>Insert canvas</button>
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
