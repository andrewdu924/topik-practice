import React, { useState, useEffect } from 'react';
import { Pencil, BookOpen, Headphones, Clock, CheckSquare, XSquare, BarChart, Home, Book, Settings, Upload, Database, AlertCircle, CheckCircle, Download, Trash2, Plus, X, Save, HelpCircle } from 'lucide-react';

// ImportExportTool 组件定义
const ImportExportTool = ({ currentQuestions, updateQuestions }) => {
  const [importStatus, setImportStatus] = useState(null);
  const [importError, setImportError] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  
  // 导入题库
  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        
        // 验证导入的数据结构
        if (!validateImportData(importedData)) {
          setImportError('导入的数据格式不正确，请检查JSON结构');
          setImportStatus('error');
          return;
        }
        
        // 合并题库
        const mergedQuestions = importNewQuestions(currentQuestions, importedData);
        updateQuestions(mergedQuestions);
        
        // 统计新增题目数量
        const newQuestionsCount = countNewQuestions(currentQuestions, importedData);
        
        setImportStatus('success');
        setImportError(null);
        alert(`成功导入 ${newQuestionsCount} 道新题目！`);
      } catch (error) {
        console.error('导入错误:', error);
        setImportError('导入失败：' + error.message);
        setImportStatus('error');
      }
    };
    
    reader.readAsText(file);
  };
  
  // 导出当前题库
  const handleExport = () => {
    const dataStr = JSON.stringify(currentQuestions, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `topik-questions-export-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
  // 清空题库
  const handleClearQuestions = () => {
    if (window.confirm('确定要清空题库吗？此操作不可恢复！')) {
      updateQuestions({
        topik1: {},
        topik2: {}
      });
      alert('题库已清空');
    }
  };
  
  // 验证导入的数据结构
  const validateImportData = (data) => {
    // 简单验证：确保至少包含topik1或topik2其中一个分类
    return (data.topik1 || data.topik2);
  };
  
  // 统计要导入的题目数量
  const countNewQuestions = (existingData, newData) => {
    let count = 0;
    
    for (const level in newData) {
      for (const year in newData[level]) {
        for (const type in newData[level][year]) {
          count += newData[level][year][type].length;
        }
      }
    }
    
    return count;
  };
  
  // 将新题目合并到现有题库
  const importNewQuestions = (existingQuestions, newQuestions) => {
    // 深拷贝现有题库
    const updatedQuestions = JSON.parse(JSON.stringify(existingQuestions));
    
    // 遍历新题目数据
    for (const level in newQuestions) {
      if (!updatedQuestions[level]) {
        updatedQuestions[level] = {};
      }
      
      for (const year in newQuestions[level]) {
        if (!updatedQuestions[level][year]) {
          updatedQuestions[level][year] = {};
        }
        
        for (const type in newQuestions[level][year]) {
          if (!updatedQuestions[level][year][type]) {
            updatedQuestions[level][year][type] = [];
          }
          
          // 添加新题目到对应类别
          updatedQuestions[level][year][type] = [
            ...updatedQuestions[level][year][type],
            ...newQuestions[level][year][type]
          ];
        }
      }
    }
    
    return updatedQuestions;
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-medium mb-4 flex items-center">
        <Database size={20} className="mr-2 text-blue-500" />
        题库管理
      </h2>
      
      <div className="space-y-4">
        {/* 导入功能 */}
        <div>
          <h3 className="text-md font-medium mb-2">导入题库</h3>
          <div className="flex items-center">
            <label className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600">
              <Upload size={16} className="mr-2" />
              选择JSON文件
              <input 
                type="file" 
                className="hidden" 
                accept=".json"
                onChange={handleImport} 
              />
            </label>
            <button 
              className="ml-2 text-blue-500 hover:text-blue-700"
              onClick={() => setShowHelp(!showHelp)}
            >
              {showHelp ? '隐藏说明' : '查看说明'}
            </button>
          </div>
          
          {importStatus === 'error' && (
            <div className="mt-2 text-red-500 flex items-center">
              <AlertCircle size={16} className="mr-1" />
              {importError}
            </div>
          )}
          
          {importStatus === 'success' && (
            <div className="mt-2 text-green-500 flex items-center">
              <CheckCircle size={16} className="mr-1" />
              导入成功！
            </div>
          )}
        </div>
        
        {/* 导入说明 */}
        {showHelp && (
          <div className="bg-gray-50 p-4 rounded-md text-sm">
            <h4 className="font-medium mb-2">导入格式说明：</h4>
            <p className="mb-2">JSON文件应包含以下结构：</p>
            <pre className="bg-gray-100 p-2 rounded-md overflow-x-auto text-xs">
{`{
  "topik1": {
    "2024": {
      "listening": [ ... 听力题数组 ... ],
      "reading": [ ... 阅读题数组 ... ]
    }
  },
  "topik2": {
    "2024": {
      "listening": [ ... 听力题数组 ... ],
      "reading": [ ... 阅读题数组 ... ],
      "writing": [ ... 写作题数组 ... ]
    }
  }
}`}
            </pre>
            <p className="mt-2">每道题目应包含：id, year, type, level, question, options, answer 等字段。</p>
          </div>
        )}
        
        {/* 导出与清空功能 */}
        <div className="flex space-x-3 mt-4">
          <button 
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            <Download size={16} className="mr-2" />
            导出题库
          </button>
          
          <button 
            onClick={handleClearQuestions}
            className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            <Trash2 size={16} className="mr-2" />
            清空题库
          </button>
        </div>
      </div>
    </div>
  );
};

// AddQuestionForm 组件定义
const AddQuestionForm = ({ onAddQuestion }) => {
  const initialState = {
    id: '',
    year: new Date().getFullYear().toString(),
    type: 'listening',
    level: 'topik1',
    part: 1,
    question: '',
    content: '',
    audioUrl: '',
    imageUrl: '',
    options: ['', '', '', ''],
    answer: 0,
    explanation: ''
  };
  
  const [formData, setFormData] = useState(initialState);
  const [showForm, setShowForm] = useState(false);
  
  // 生成ID建议
  const generateIdSuggestion = () => {
    const prefix = `${formData.year}-${formData.type.charAt(0)}${formData.level.charAt(formData.level.length - 1)}`;
    // 自动生成序号，实际使用时可能需要更复杂的逻辑
    const suffix = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `${prefix}-${suffix}`;
  };
  
  // 处理输入变化
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // 当改变年份、类型或级别时，自动更新ID建议
    if (['year', 'type', 'level'].includes(name)) {
      // 延迟执行，确保其他状态已更新
      setTimeout(() => {
        const suggestedId = generateIdSuggestion();
        setFormData(prev => ({
          ...prev,
          id: suggestedId
        }));
      }, 0);
    }
  };
  
  // 处理选项变化
  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({
      ...formData,
      options: newOptions
    });
  };
  
  // 添加选项
  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, '']
    });
  };
  
  // 删除选项
  const removeOption = (index) => {
    const newOptions = formData.options.filter((_, i) => i !== index);
    // 如果删除的是当前选中的答案，重置答案
    let newAnswer = formData.answer;
    if (index === formData.answer) {
      newAnswer = 0;
    } else if (index < formData.answer) {
      newAnswer = formData.answer - 1;
    }
    
    setFormData({
      ...formData,
      options: newOptions,
      answer: newAnswer
    });
  };
  
  // 提交表单
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 验证必填字段
    if (!formData.id || !formData.question) {
      alert('请填写必要的字段：ID和题目问题');
      return;
    }
    
    // 如果是写作题，将答案设为null
    const finalData = {
      ...formData,
      answer: formData.type === 'writing' ? null : parseInt(formData.answer, 10)
    };
    
    // 添加到题库
    onAddQuestion(finalData);
    
    // 重置表单
    setFormData(initialState);
    setShowForm(false);
  };
  
  if (!showForm) {
    return (
      <button 
        onClick={() => setShowForm(true)}
        className="w-full py-3 bg-blue-500 text-white rounded-md flex items-center justify-center hover:bg-blue-600"
      >
        <Plus size={18} className="mr-2" />
        添加新题目
      </button>
    );
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">添加新题目</h3>
        <button 
          onClick={() => setShowForm(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* 基本信息 */}
          <div>
            <label className="block text-sm font-medium mb-1">题目ID</label>
            <div className="flex">
              <input
                type="text"
                name="id"
                value={formData.id}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="例如: 2024-l1-1"
              />
              <button 
                type="button"
                onClick={() => setFormData({...formData, id: generateIdSuggestion()})}
                className="ml-2 px-2 bg-gray-100 rounded-md text-xs"
                title="生成ID建议"
              >
                <HelpCircle size={16} />
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">年份</label>
            <input
              type="text"
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="例如: 2024"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">级别</label>
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="topik1">TOPIK I (初级)</option>
              <option value="topik2">TOPIK II (中高级)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">题型</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="listening">听力</option>
              <option value="reading">阅读</option>
              {formData.level === 'topik2' && <option value="writing">写作</option>}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">部分</label>
            <select
              name="part"
              value={formData.part}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value={1}>第1部分</option>
              <option value={2}>第2部分</option>
              <option value={3}>第3部分</option>
              <option value={4}>第4部分</option>
            </select>
          </div>
        </div>
        
        {/* 题目内容 */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">题目问题</label>
          <input
            type="text"
            name="question"
            value={formData.question}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="输入题目问题"
            required
          />
        </div>
        
        {/* 内容（阅读材料或图片描述） */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            {formData.type === 'reading' ? '阅读内容' : '补充内容描述'}
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={4}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder={formData.type === 'reading' ? '输入阅读材料内容' : '输入补充描述'}
          />
        </div>
        
        {/* 媒体URL */}
        {formData.type === 'listening' && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">音频URL</label>
            <input
              type="text"
              name="audioUrl"
              value={formData.audioUrl}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="输入音频文件链接"
            />
          </div>
        )}
        
        {formData.type === 'writing' && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">图片URL</label>
            <input
              type="text"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="输入图片文件链接"
            />
          </div>
        )}
        
        {/* 选项（听力和阅读题） */}
        {(formData.type === 'listening' || formData.type === 'reading') && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">选项</label>
              <button 
                type="button"
                onClick={addOption}
                className="text-blue-500 hover:text-blue-700 text-sm flex items-center"
                disabled={formData.options.length >= 6}
              >
                <Plus size={14} className="mr-1" />
                添加选项
              </button>
            </div>
            
            {formData.options.map((option, index) => (
              <div key={index} className="flex mb-2">
                <div className="flex items-center mr-2">
                  <input
                    type="radio"
                    checked={parseInt(formData.answer) === index}
                    onChange={() => setFormData({...formData, answer: index})}
                    className="mr-1"
                  />
                  <span>{index + 1}.</span>
                </div>
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md"
                  placeholder={`选项 ${index + 1}`}
                />
                {formData.options.length > 2 && (
                  <button 
                    type="button"
                    onClick={() => removeOption(index)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* 解释 */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">解释/答案解析</label>
          <textarea
            name="explanation"
            value={formData.explanation}
            onChange={handleChange}
            rows={3}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="输入答案解析或解释"
          />
        </div>
        
        {/* 提交按钮 */}
        <div className="flex justify-end">
          <button 
            type="button" 
            onClick={() => setShowForm(false)}
            className="px-4 py-2 border border-gray-300 rounded-md mr-2"
          >
            取消
          </button>
          <button 
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md flex items-center"
          >
            <Save size={16} className="mr-2" />
            保存题目
          </button>
        </div>
      </form>
    </div>
  );
};

// 完整TOPIK题库数据
const sampleQuestions = {
  // TOPIK I (初级)
  topik1: {
    // 2023年试题
    "2023": {
      listening: [
        {
          id: '2023-l1-1',
          year: '2023',
          type: 'listening',
          level: 'topik1',
          part: 1,
          question: '다음을 듣고 알맞은 그림을 고르십시오.',
          audioUrl: null, // 实际环境中这里会是音频文件URL
          options: [
            '여자는 책을 읽고 있습니다.',
            '여자는 음악을 듣고 있습니다.',
            '여자는 텔레비전을 보고 있습니다.',
            '여자는 쇼핑을 하고 있습니다.'
          ],
          answer: 1,
          explanation: '音频中说女士正在听音乐，因此答案是选项2'
        },
        {
          id: '2023-l1-2',
          year: '2023',
          type: 'listening',
          level: 'topik1',
          part: 1,
          question: '이 사람은 무엇을 좋아합니까?',
          audioUrl: null,
          options: [
            '영화 보기',
            '책 읽기',
            '노래 부르기',
            '요리하기'
          ],
          answer: 2,
          explanation: '音频中提到此人喜欢唱歌，因此答案是选项3'
        },
        {
          id: '2023-l1-3',
          year: '2023',
          type: 'listening',
          level: 'topik1',
          part: 1,
          question: '남자는 무엇을 샀습니까?',
          audioUrl: null,
          options: [
            '컴퓨터',
            '가방',
            '모자',
            '신발'
          ],
          answer: 3,
          explanation: '音频中提到男子买了鞋子，因此答案是选项4'
        },
        {
          id: '2023-l1-4',
          year: '2023',
          type: 'listening',
          level: 'topik1',
          part: 2,
          question: '여자는 지금 무엇을 합니까?',
          audioUrl: null,
          options: [
            '요리를 배우고 있습니다.',
            '음식을 먹고 있습니다.',
            '요리를 하고 있습니다.',
            '음식을 사고 있습니다.'
          ],
          answer: 2,
          explanation: '音频中提到女士正在做饭，因此答案是选项3'
        },
        {
          id: '2023-l1-5',
          year: '2023',
          type: 'listening',
          level: 'topik1',
          part: 2,
          question: '남자는 어디에 갑니까?',
          audioUrl: null,
          options: [
            '병원',
            '약국',
            '학교',
            '도서관'
          ],
          answer: 3,
          explanation: '音频中提到男子要去图书馆，因此答案是选项4'
        },
        {
          id: '2023-l1-6',
          year: '2023',
          type: 'listening',
          level: 'topik1',
          part: 3,
          question: '두 사람은 무엇에 대해 이야기하고 있습니까?',
          audioUrl: null,
          options: [
            '주말 계획',
            '점심 메뉴',
            '한국어 공부',
            '영화 감상'
          ],
          answer: 0,
          explanation: '音频中两人在讨论周末计划，因此答案是选项1'
        },
        {
          id: '2023-l1-7',
          year: '2023',
          type: 'listening',
          level: 'topik1',
          part: 3,
          question: '여자는 무엇을 하려고 합니까?',
          audioUrl: null,
          options: [
            '친구를 만나러 가려고 합니다.',
            '책을 읽으려고 합니다.',
            '영화를 보려고 합니다.',
            '쇼핑을 하려고 합니다.'
          ],
          answer: 2,
          explanation: '音频中女士表示要去看电影，因此答案是选项3'
        },
        {
          id: '2023-l1-8',
          year: '2023',
          type: 'listening',
          level: 'topik1',
          part: 4,
          question: '여자가 제일 좋아하는 음식은 무엇입니까?',
          audioUrl: null,
          options: [
            '김치찌개',
            '비빔밥',
            '불고기',
            '떡볶이'
          ],
          answer: 1,
          explanation: '音频中女士表示最喜欢的食物是拌饭，因此答案是选项2'
        },
        {
          id: '2023-l1-9',
          year: '2023',
          type: 'listening',
          level: 'topik1',
          part: 4,
          question: '들은 내용과 같은 것을 고르십시오.',
          audioUrl: null,
          options: [
            '남자는 일요일에 등산을 갔습니다.',
            '남자는 친구와 함께 등산을 갔습니다.',
            '남자는 산에서 사진을 찍었습니다.',
            '남자는 내일 다시 등산을 갈 것입니다.'
          ],
          answer: 2,
          explanation: '音频中提到男子在山上拍了照片，因此答案是选项3'
        },
        {
          id: '2023-l1-10',
          year: '2023',
          type: 'listening',
          level: 'topik1',
          part: 4,
          question: '남자는 왜 기분이 좋습니까?',
          audioUrl: null,
          options: [
            '좋은 책을 읽어서',
            '시험을 잘 봐서',
            '여행을 다녀와서',
            '새 친구를 사귀어서'
          ],
          answer: 1,
          explanation: '音频中男子表示因为考试考得好所以心情好，因此答案是选项2'
        }
      ],
      reading: [
        {
          id: '2023-r1-1',
          year: '2023',
          type: 'reading',
          level: 'topik1',
          part: 1,
          question: '다음 글을 읽고 무엇에 대한 글인지 고르십시오.',
          content: '저는 아침에 일어나서 운동을 합니다. 그리고 아침을 먹습니다. 학교에 가기 전에 항상 이렇게 합니다.',
          options: [
            '취미',
            '아침 습관',
            '학교 생활',
            '운동 방법'
          ],
          answer: 1,
          explanation: '文章描述了"我"早上起床后的习惯，因此是关于"早晨习惯"的文章'
        },
        {
          id: '2023-r1-2',
          year: '2023',
          type: 'reading',
          level: 'topik1',
          part: 1,
          question: '다음이 무엇인지 고르십시오.',
          content: '서울 - 부산\n출발: 오전 9시\n도착: 오후 12시\n가격: 59,800원',
          options: [
            '기차표',
            '버스표',
            '영화표',
            '비행기표'
          ],
          answer: 0,
          explanation: '这是一张从首尔到釜山的火车票，包含出发时间、到达时间和价格'
        },
        {
          id: '2023-r1-3',
          year: '2023',
          type: 'reading',
          level: 'topik1',
          part: 1,
          question: '이 사람은 지금 무엇을 하고 있습니까?',
          content: '안녕하세요? 저는 한국 친구를 찾고 있습니다. 저는 중국 사람이에요. 한국어를 배우고 있어요. 같이 이야기하고 싶어요. 제 이메일은 wang@email.com입니다.',
          options: [
            '한국어를 가르치고 있습니다.',
            '한국 친구를 찾고 있습니다.',
            '중국어를 배우고 있습니다.',
            '이메일을 보내고 있습니다.'
          ],
          answer: 1,
          explanation: '文章中写道"我正在寻找韩国朋友"，因此答案是选项2'
        },
        {
          id: '2023-r1-4',
          year: '2023',
          type: 'reading',
          level: 'topik1',
          part: 2,
          question: '다음 글의 내용과 같은 것을 고르십시오.',
          content: '저는 주말에 집에서 요리를 합니다. 오늘은 김치찌개를 만들었습니다. 맛있게 되었습니다. 내일은 불고기를 만들 것입니다.',
          options: [
            '저는 주말에 요리를 배웁니다.',
            '오늘 김치찌개를 먹었습니다.',
            '요리가 맛있게 되었습니다.',
            '내일은 요리를 하지 않을 것입니다.'
          ],
          answer: 2,
          explanation: '文章中写道"菜做得很好吃"，因此答案是选项3'
        },
        {
          id: '2023-r1-5',
          year: '2023',
          type: 'reading',
          level: 'topik1',
          part: 2,
          question: '다음 글의 내용과 다른 것을 고르십시오.',
          content: '내일 친구 생일 파티가 있습니다. 저는 선물을 사러 백화점에 갔습니다. 친구가 운동을 좋아해서 운동화를 샀습니다. 그리고 케이크도 주문했습니다.',
          options: [
            '내일은 친구 생일입니다.',
            '백화점에서 선물을 샀습니다.',
            '친구에게 운동화를 선물했습니다.',
            '친구가 케이크를 좋아합니다.'
          ],
          answer: 3,
          explanation: '文章中没有提到朋友喜欢蛋糕，只提到朋友喜欢运动，因此答案是选项4'
        },
        {
          id: '2023-r1-6',
          year: '2023',
          type: 'reading',
          level: 'topik1',
          part: 3,
          question: '다음 글을 읽고 물음에 답하십시오.\n\n저는 한국에서 대학교에 다니고 있습니다. 학교 근처에 기숙사가 있어서 기숙사에서 살고 있습니다. 학교가 끝나면 항상 기숙사에 와서 숙제를 합니다. 주말에는 친구들과 영화를 보거나 쇼핑을 하러 갑니다.\n\n이 사람은 어디에 삽니까?',
          content: null,
          options: [
            '학교',
            '기숙사',
            '친구 집',
            '영화관'
          ],
          answer: 1,
          explanation: '文章中写道"我住在宿舍里"，因此答案是选项2'
        },
        {
          id: '2023-r1-7',
          year: '2023',
          type: 'reading',
          level: 'topik1',
          part: 3,
          question: '다음 글을 읽고 물음에 답하십시오.\n\n오늘 오후에 비가 올 거예요. 우산을 가지고 가세요. 내일은 날씨가 맑을 거예요.\n\n이 글의 내용과 같은 것을 고르십시오.',
          content: null,
          options: [
            '오늘 아침에 비가 왔어요.',
            '오늘 오후에 비가 올 거예요.',
            '내일도 비가 올 거예요.',
            '우산을 가지고 가면 안 돼요.'
          ],
          answer: 1,
          explanation: '文章中写道"今天下午将会下雨"，因此答案是选项2'
        },
        {
          id: '2023-r1-8',
          year: '2023',
          type: 'reading',
          level: 'topik1',
          part: 4,
          question: '다음 글을 읽고 순서에 맞게 배열하십시오.',
          content: 'a. 물을 컵에 따릅니다.\nb. 차를 마십니다.\nc. 찻잎을 넣습니다.\nd. 뜨거운 물을 붓습니다.',
          options: [
            'a-c-d-b',
            'c-a-d-b',
            'c-d-a-b',
            'a-d-c-b'
          ],
          answer: 2,
          explanation: '正确的泡茶顺序是：放入茶叶(c) -> 倒入热水(d) -> 倒入杯中(a) -> 喝茶(b)'
        },
        {
          id: '2023-r1-9',
          year: '2023',
          type: 'reading',
          level: 'topik1',
          part: 4,
          question: '다음 글을 읽고 물음에 답하십시오.\n\n오늘은 제 생일입니다. 친구들이 저에게 선물을 줬습니다. 민수 씨는 책을 줬습니다. 영희 씨는 케이크를 줬습니다. 그리고 수진 씨는 꽃을 줬습니다. 정말 기뻤습니다.\n\n민수 씨가 준 선물은 무엇입니까?',
          content: null,
          options: [
            '케이크',
            '책',
            '꽃',
            '옷'
          ],
          answer: 1,
          explanation: '文章中写道"Minsu给了我一本书"，因此答案是选项2'
        },
        {
          id: '2023-r1-10',
          year: '2023',
          type: 'reading',
          level: 'topik1',
          part: 4,
          question: '다음 글을 읽고 물음에 답하십시오.\n\n저는 한국어학당에서 한국어를 배웁니다. 우리 반에는 학생이 열 명 있습니다. 중국 학생이 다섯 명, 일본 학생이 세 명, 미국 학생이 두 명 있습니다. 우리는 모두 좋은 친구입니다.\n\n다음 중 맞는 것을 고르십시오.',
          content: null,
          options: [
            '반에 학생이 스무 명 있습니다.',
            '중국 학생이 가장 많습니다.',
            '일본 학생이 다섯 명 있습니다.',
            '미국 학생이 세 명 있습니다.'
          ],
          answer: 1,
          explanation: '文章中提到中国学生有5名，日本学生有3名，美国学生有2名，中国学生人数最多，因此答案是选项2'
        }
      ]
    },
    // 2022年试题
    "2022": {
      listening: [
        {
          id: '2022-l1-1',
          year: '2022',
          type: 'listening',
          level: 'topik1',
          part: 1,
          question: '남자는 무엇을 합니까?',
          audioUrl: null,
          options: [
            '책을 읽습니다.',
            '운동을 합니다.',
            '요리를 합니다.',
            '음악을 듣습니다.'
          ],
          answer: 3,
          explanation: '音频中提到男子在听音乐，因此答案是选项4'
        },
        {
          id: '2022-l1-2',
          year: '2022',
          type: 'listening',
          level: 'topik1',
          part: 1,
          question: '여자는 어디에 갑니까?',
          audioUrl: null,
          options: [
            '도서관',
            '병원',
            '학교',
            '회사'
          ],
          answer: 0,
          explanation: '音频中提到女士要去图书馆，因此答案是选项1'
        }
      ],
      reading: [
        {
          id: '2022-r1-1',
          year: '2022',
          type: 'reading',
          level: 'topik1',
          part: 1,
          question: '이것은 무엇입니까?',
          content: '이름: 김민수\n전화번호: 010-1234-5678\n주소: 서울시 강남구 역삼동 123-45',
          options: [
            '일기',
            '편지',
            '명함',
            '메모'
          ],
          answer: 2,
          explanation: '这是包含姓名、电话号码和地址的名片格式，因此答案是选项3'
        },
        {
          id: '2022-r1-2',
          year: '2022',
          type: 'reading',
          level: 'topik1',
          part: 2,
          question: '다음 글을 읽고 중심 생각을 고르십시오.',
          content: '운동은 건강에 좋습니다. 매일 30분 이상 운동을 하면 몸이 건강해집니다. 하지만 너무 많이 운동을 하면 몸이 아플 수 있습니다. 그래서 적당히 운동을 해야 합니다.',
          options: [
            '운동은 매일 해야 합니다.',
            '운동은 건강에 좋지 않습니다.',
            '적당한 운동이 건강에 좋습니다.',
            '아프면 운동을 하면 안 됩니다.'
          ],
          answer: 2,
          explanation: '文章的中心思想是适当的运动对健康有益，因此答案是选项3'
        }
      ]
    },
    // 2021年试题
    "2021": {
      listening: [
        {
          id: '2021-l1-1',
          year: '2021',
          type: 'listening',
          level: 'topik1',
          part: 1,
          question: '여자의 취미가 무엇입니까?',
          audioUrl: null,
          options: [
            '요리',
            '독서',
            '영화 보기',
            '여행'
          ],
          answer: 0,
          explanation: '音频中提到女士的爱好是烹饪，因此答案是选项1'
        }
      ],
      reading: [
        {
          id: '2021-r1-1',
          year: '2021',
          type: 'reading',
          level: 'topik1',
          part: 1,
          question: '무엇에 대한 안내문입니까?',
          content: '한국어 말하기 대회\n- 일시: 2021년 5월 15일 오후 2시\n- 장소: 대학교 강당\n- 대상: 외국인 학생\n- 상품: 1등 - 300,000원, 2등 - 200,000원, 3등 - 100,000원',
          options: [
            '한국어 시험',
            '한국어 수업',
            '한국어 말하기 대회',
            '한국어 쓰기 대회'
          ],
          answer: 2,
          explanation: '这是关于韩语演讲比赛的通知，因此答案是选项3'
        }
      ]
    }
  },
  
  // TOPIK II (中高级)
  topik2: {
    // 2023年试题
    "2023": {
      listening: [
        {
          id: '2023-l2-1',
          year: '2023',
          type: 'listening',
          level: 'topik2',
          part: 1,
          question: '남자의 생각으로 맞는 것을 고르십시오.',
          audioUrl: null,
          options: [
            '인터넷 강의가 효과적이다.',
            '직접 만나서 공부하는 것이 좋다.',
            '한국어는 독학으로 배우기 어렵다.',
            '언어는 매일 조금씩 공부해야 한다.'
          ],
          answer: 1,
          explanation: '音频中男子表示面对面学习比网络课程更有效果，因此答案是选项2'
        },
        {
          id: '2023-l2-2',
          year: '2023',
          type: 'listening',
          level: 'topik2',
          part: 1,
          question: '여자가 남자에게 부탁한 것은 무엇입니까?',
          audioUrl: null,
          options: [
            '회의 준비를 도와 달라고 했습니다.',
            '발표 자료를 검토해 달라고 했습니다.',
            '회의에 참석해 달라고 했습니다.',
            '발표를 대신해 달라고 했습니다.'
          ],
          answer: 3,
          explanation: '音频中女士请求男子代替她进行演讲，因此答案是选项4'
        },
        {
          id: '2023-l2-3',
          year: '2023',
          type: 'listening',
          level: 'topik2',
          part: 2,
          question: '남자가 여행을 취소한 이유는 무엇입니까?',
          audioUrl: null,
          options: [
            '날씨가 좋지 않아서',
            '건강이 좋지 않아서',
            '일이 많아져서',
            '돈이 부족해서'
          ],
          answer: 2,
          explanation: '音频中男子表示因为工作变多所以取消了旅行，因此答案是选项3'
        },
        {
          id: '2023-l2-4',
          year: '2023',
          type: 'listening',
          level: 'topik2',
          part: 2,
          question: '대화의 내용과 같은 것을 고르십시오.',
          audioUrl: null,
          options: [
            '여자는 이사한 지 일주일이 되었습니다.',
            '남자는 여자의 새집을 방문한 적이 있습니다.',
            '여자의 집은 지하철역에서 가깝습니다.',
            '남자는 이번 주말에 여자의 집에 갈 것입니다.'
          ],
          answer: 3,
          explanation: '音频中男子表示这个周末会去女士家，因此答案是选项4'
        },
        {
          id: '2023-l2-5',
          year: '2023',
          type: 'listening',
          level: 'topik2',
          part: 3,
          question: '여자의 고민은 무엇입니까?',
          audioUrl: null,
          options: [
            '직장에서 인간관계가 어렵다.',
            '일과 공부를 병행하기 힘들다.',
            '새로운 직장을 구하기 어렵다.',
            '전공과 다른 일을 하고 있다.'
          ],
          answer: 1,
          explanation: '音频中女士表示工作和学习很难兼顾，因此答案是选项2'
        }
      ],
      reading: [
        {
          id: '2023-r2-1',
          year: '2023',
          type: 'reading',
          level: 'topik2',
          part: 1,
          question: '다음 글의 주제로 알맞은 것을 고르십시오.',
          content: '요즘 젊은 세대들은 디지털 기기를 통해 소통하는 것을 선호한다. 하지만 얼굴을 마주 보고 대화하는 것의 중요성은 여전히 크다. 직접적인 소통을 통해 감정을 더 정확하게 전달할 수 있기 때문이다.',
          options: [
            '디지털 기기의 발전',
            '젊은 세대의 특징',
            '대면 소통의 중요성',
            '의사소통 방식의 변화'
          ],
          answer: 2,
          explanation: '文章主要讨论了面对面交流的重要性，尽管年轻一代更喜欢通过数字设备交流，因此答案是选项3'
        },
        {
          id: '2023-r2-2',
          year: '2023',
          type: 'reading',
          level: 'topik2',
          part: 1,
          question: '다음 글의 내용과 같은 것을 고르십시오.',
          content: '한국의 결혼식은 전통 혼례와 현대식 결혼식으로 나눌 수 있다. 전통 혼례는 주로 한복을 입고 전통적인 의식에 따라 진행된다. 반면 현대식 결혼식은 서양식 드레스와 턱시도를 입고 결혼식장이나 호텔에서 진행되는 경우가 많다.',
          options: [
            '한국에서는 모든 결혼식이 전통 방식으로 진행된다.',
            '현대식 결혼식에서는 반드시 한복을 입어야 한다.',
            '전통 혼례는 주로 호텔에서 진행된다.',
            '한국의 결혼식에는 전통식과 현대식이 있다.'
          ],
          answer: 3,
          explanation: '文章提到韩国的婚礼可以分为传统婚礼和现代婚礼，因此答案是选项4'
        },
        {
          id: '2023-r2-3',
          year: '2023',
          type: 'reading',
          level: 'topik2',
          part: 2,
          question: '밑줄 친 부분에 들어갈 말로 가장 알맞은 것을 고르십시오.\n\n환경 오염이 심각해지면서 친환경 제품에 대한 관심이 높아지고 있다. 이에 따라 많은 기업들이 친환경 제품을 개발하고 있으며, 소비자들도 환경을 생각하는 소비를 하려고 노력하고 있다. 이러한 현상은 ________ 볼 수 있다.',
          content: null,
          options: [
            '환경 문제의 원인으로',
            '기업의 이익만을 위한 것으로',
            '긍정적인 사회 변화로',
            '소비자들의 경제적 부담으로'
          ],
          answer: 2,
          explanation: '根据上下文，人们对环保产品的关注和企业开发环保产品被视为积极的社会变化，因此答案是选项3'
        },
        {
          id: '2023-r2-4',
          year: '2023',
          type: 'reading',
          level: 'topik2',
          part: 2,
          question: '다음 글의 목적으로 가장 알맞은 것을 고르십시오.',
          content: '안녕하세요, 입주민 여러분. 다음 주 화요일 오전 10시부터 오후 3시까지 아파트 단지 내 수도관 공사가 있을 예정입니다. 공사 시간 동안에는 수돗물 사용이 제한되오니 미리 물을 받아 두시기 바랍니다. 불편을 드려 죄송합니다.',
          options: [
            '수도관 공사를 홍보하기 위해',
            '수돗물 절약을 권장하기 위해',
            '공사로 인한 불편을 알리기 위해',
            '아파트 관리비 인상을 안내하기 위해'
          ],
          answer: 2,
          explanation: '这篇文章的目的是通知居民由于水管工程可能带来的不便，因此答案是选项3'
        },
        {
          id: '2023-r2-5',
          year: '2023',
          type: 'reading',
          level: 'topik2',
          part: 3,
          question: '다음 글을 읽고 물음에 답하십시오.\n\n최근 연구에 따르면 적절한 운동은 뇌 기능 향상에 도움이 된다고 한다. 특히 유산소 운동은 뇌에 산소와 영양분 공급을 증가시켜 인지 능력과 기억력을 향상시킨다. 또한 규칙적인 운동은 스트레스를 줄이고 기분을 좋게 만들어 정신 건강에도 긍정적인 영향을 미친다.\n\n글의 내용과 일치하지 않는 것을 고르십시오.',
          content: null,
          options: [
            '운동은 뇌 기능 향상에 도움이 된다.',
            '유산소 운동은 뇌에 영양분 공급을 증가시킨다.',
            '규칙적인 운동은 정신 건강에 좋다.',
            '모든 종류의 운동은 같은 효과가 있다.'
          ],
          answer: 3,
          explanation: '文章中没有提到所有类型的运动效果相同，而是特别强调了有氧运动的好处，因此答案是选项4'
        }
      ],
      writing: [
        {
          id: '2023-w2-1',
          year: '2023',
          type: 'writing',
          level: 'topik2',
          part: 1,
          question: '다음 그림을 보고 200~300자로 글을 쓰십시오.',
          imageUrl: null, // 实际环境中这里会是图片URL
          content: '图片显示了一个繁忙的城市街道场景',
          answer: null, // 写作题没有标准答案
          explanation: '描述图片中的场景，可以包括：人们在做什么，环境如何，以及你对这个场景的感受或想法'
        },
        {
          id: '2023-w2-2',
          year: '2023',
          type: 'writing',
          level: 'topik2',
          part: 2,
          question: '다음을 읽고 자신의 생각을 600~700자로 글을 쓰십시오.\n\n현대 사회에서 기술의 발전은 우리의 삶을 더 편리하게 만들었지만, 동시에 새로운 문제들도 가져왔다. 이에 대한 자신의 생각을 서술하시오.',
          content: null,
          answer: null,
          explanation: '写一篇600-700字的作文，讨论现代社会中技术发展带来的便利和问题，并表达自己的观点'
        }
      ]
    },
    // 2022年试题
    "2022": {
      listening: [
        {
          id: '2022-l2-1',
          year: '2022',
          type: 'listening',
          level: 'topik2',
          part: 1,
          question: '들은 내용과 일치하는 것을 고르십시오.',
          audioUrl: null,
          options: [
            '남자는 대학교 교수이다.',
            '여자는 처음으로 한국어를 배운다.',
            '남자는 한국어 교재를 만들었다.',
            '여자는 한국어를 2년 동안 배웠다.'
          ],
          answer: 2,
          explanation: '音频中提到男子制作了韩语教材，因此答案是选项3'
        }
      ],
      reading: [
        {
          id: '2022-r2-1',
          year: '2022',
          type: 'reading',
          level: 'topik2',
          part: "1",
          question: '다음 글에서 알 수 있는 것을 고르십시오.',
          content: '한국의 전통 가옥인 한옥은 자연 재료를 사용하여 지어진다. 나무, 흙, 돌, 종이 등의 자연 재료는 여름에는 시원하고 겨울에는 따뜻한 환경을 만들어 준다. 특히 온돌 시스템은 바닥을 따뜻하게 해주어 겨울철 추위를 이겨내는 데 큰 역할을 한다.',
          options: [
            '한옥은 현대식 재료로 지어진다.',
            '한옥은 여름에는 춥고 겨울에는 덥다.',
            '온돌은 바닥을 따뜻하게 하는 시스템이다.',
            '한옥은 주로 도시 중심부에 지어진다.'
          ],
          answer: 2,
          explanation: '文章中提到"特别是温突系统，它能温暖地板，在冬季寒冷时发挥重要作用"，因此答案是选项3'
        }
      ],
      writing: [
        {
          id: '2022-w2-1',
          year: '2022',
          type: 'writing',
          level: 'topik2',
          part: 1,
          question: '다음 표를 보고 자신의 하루 일과에 대해 200~300자로 글을 쓰십시오.',
          content: '时间表显示了一天的活动安排：\n7:00 起床\n8:00 早餐\n9:00-12:00 上课\n12:00-13:00 午餐\n13:00-18:00 自习\n18:00-19:00 晚餐\n19:00-22:00 休息\n23:00 就寝',
          answer: null,
          explanation: '根据给出的时间表，描述自己的一天日程安排，字数在200-300字之间'
        }
      ]
    },
    // 2021年试题
    "2021": {
      listening: [
        {
          id: '2021-l2-1',
          year: '2021',
          type: 'listening',
          level: 'topik2',
          part: 1,
          question: '남자가 말하고자 하는 것은 무엇입니까?',
          audioUrl: null,
          options: [
            '환경 보호의 중요성',
            '경제 성장의 필요성',
            '기술 발전의 장단점',
            '지속 가능한 발전 방법'
          ],
          answer: 3,
          explanation: '音频中男子讨论的是可持续发展的方法，因此答案是选项4'
        }
      ],
      reading: [
        {
          id: '2021-r2-1',
          year: '2021',
          type: 'reading',
          level: 'topik2',
          part: 1,
          question: '다음 글의 중심 내용으로 알맞은 것을 고르십시오.',
          content: '직장에서의 의사소통은 업무 효율성과 조직 분위기에 큰 영향을 미친다. 효과적인 의사소통은 업무 지시를 명확히 하고 오해를 줄여 업무 처리 시간을 단축시킨다. 또한 동료 간의 신뢰를 형성하여 협업을 원활하게 한다. 따라서 조직 내 의사소통 개선을 위한 노력이 필요하다.',
          options: [
            '직장 내 갈등 해결 방법',
            '업무 효율성 향상 전략',
            '조직 문화의 중요성',
            '직장에서의 효과적인 의사소통의 중요성'
          ],
          answer: 3,
          explanation: '文章主要讨论的是职场中有效沟通的重要性，因此答案是选项4'
        }
      ],
      writing: [
        {
          id: '2021-w2-1',
          year: '2021',
          type: 'writing',
          level: 'topik2',
          part: 1,
          question: '자신이 가장 좋아하는 여행지에 대해 200~300자로 글을 쓰십시오.',
          content: null,
          answer: null,
          explanation: '写一篇200-300字的作文，描述自己最喜欢的旅游地点，可以包括为什么喜欢、有什么特色、什么时候去过等内容'
        }
      ]
    }
  }
};

// 主应用组件
const App = () => {
  // 状态管理
  const [activeTab, setActiveTab] = useState('home');
  const [level, setLevel] = useState('topik1');
  const [questionType, setQuestionType] = useState('listening');
  const [examYear, setExamYear] = useState('2023');
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [timerActive, setTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [practiceMode, setPracticeMode] = useState('regular'); // regular, mock, wrong
  const [allQuestions, setAllQuestions] = useState(sampleQuestions); // 全部题库数据

  // 从localStorage加载数据
  useEffect(() => {
    // 加载错题集
    const savedWrongAnswers = localStorage.getItem('topikWrongAnswers');
    if (savedWrongAnswers) {
      setWrongAnswers(JSON.parse(savedWrongAnswers));
    }
    
    // 加载自定义题库
    const savedQuestions = localStorage.getItem('topikQuestions');
    if (savedQuestions) {
      setAllQuestions(JSON.parse(savedQuestions));
    }
  }, []);

  // 保存数据到localStorage
  useEffect(() => {
    // 保存错题集
    if (wrongAnswers.length > 0) {
      localStorage.setItem('topikWrongAnswers', JSON.stringify(wrongAnswers));
    }
    
    // 保存题库
    localStorage.setItem('topikQuestions', JSON.stringify(allQuestions));
  }, [wrongAnswers, allQuestions]);

  // 计时器逻辑
  useEffect(() => {
    let timer = null;
    if (timerActive && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && timerActive) {
      finishExercise();
    }
    return () => clearInterval(timer);
  }, [timerActive, timeRemaining]);

  // 设置练习题目
  const setupQuestions = (mode) => {
    setPracticeMode(mode);
    
    let questions = [];
    if (mode === 'wrong') {
      questions = wrongAnswers;
    } else if (mode === 'mock') {
      // 模拟考试模式 - 选择多种题型
      const selectedYearData = allQuestions[level][examYear] || {};
      const questionsList = [
        ...selectedYearData.listening || [],
        ...selectedYearData.reading || []
      ];
      
      if (level === 'topik2' && selectedYearData.writing) {
        questionsList.push(...selectedYearData.writing);
      }
      
      questions = questionsList;
      
      // 设置计时器 (TOPIK I: 30分钟, TOPIK II: 50分钟)
      setTimeRemaining(level === 'topik1' ? 30 * 60 : 50 * 60);
      setTimerActive(true);
    } else {
      // 常规练习模式 - 按级别、年份和题型选择
      const selectedYearData = allQuestions[level][examYear] || {};
      questions = selectedYearData[questionType] || [];
    }
    
    setCurrentQuestions(questions);
    setCurrentIndex(0);
    setUserAnswers({});
    setShowResults(false);
  };
  
  // 添加新题目
  const handleAddQuestion = (newQuestion) => {
    // 深拷贝现有题库
    const updatedQuestions = JSON.parse(JSON.stringify(allQuestions));
    
    const { level, year, type } = newQuestion;
    
    // 确保各层级对象存在
    if (!updatedQuestions[level]) {
      updatedQuestions[level] = {};
    }
    
    if (!updatedQuestions[level][year]) {
      updatedQuestions[level][year] = {};
    }
    
    if (!updatedQuestions[level][year][type]) {
      updatedQuestions[level][year][type] = [];
    }
    
    // 检查ID是否重复
    const isDuplicate = updatedQuestions[level][year][type].some(q => q.id === newQuestion.id);
    
    if (isDuplicate) {
      if (window.confirm(`已存在ID为 ${newQuestion.id} 的题目，要替换它吗？`)) {
        // 替换已有题目
        const index = updatedQuestions[level][year][type].findIndex(q => q.id === newQuestion.id);
        updatedQuestions[level][year][type][index] = newQuestion;
      } else {
        return; // 取消添加
      }
    } else {
      // 添加新题目
      updatedQuestions[level][year][type].push(newQuestion);
    }
    
    // 更新题库
    setAllQuestions(updatedQuestions);
    alert(`成功添加题目: ${newQuestion.id}`);
  };

  // 提交答案
  const submitAnswer = (questionId, selectedOption) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: selectedOption
    }));
  };

  // 完成练习
  const finishExercise = () => {
    setTimerActive(false);
    setShowResults(true);
    
    // 记录错题
    const newWrongAnswers = currentQuestions.filter(q => {
      return q.answer !== null && userAnswers[q.id] !== q.answer;
    });
    
    if (newWrongAnswers.length > 0) {
      // 避免重复添加错题
      const existingIds = new Set(wrongAnswers.map(q => q.id));
      const uniqueNewWrongs = newWrongAnswers.filter(q => !existingIds.has(q.id));
      
      if (uniqueNewWrongs.length > 0) {
        setWrongAnswers(prev => [...prev, ...uniqueNewWrongs]);
      }
    }
  };

  // 格式化时间显示
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 计算统计数据
  const calculateStats = () => {
    if (currentQuestions.length === 0) return { correct: 0, percentage: 0 };
    
    const answeredQuestions = currentQuestions.filter(q => q.answer !== null);
    const correctAnswers = answeredQuestions.filter(q => userAnswers[q.id] === q.answer);
    
    return {
      correct: correctAnswers.length,
      percentage: Math.round((correctAnswers.length / answeredQuestions.length) * 100) || 0
    };
  };
  
  // 针对不同题型的问题组件
  const QuestionRenderer = ({ question }) => {
    if (!question) return <div>题目载入中...</div>;
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
            {question.id}
          </span>
          <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
            {question.level === 'topik1' ? 'TOPIK I' : 'TOPIK II'}
          </span>
          <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
            {question.year}年
          </span>
          <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
            {question.type === 'listening' ? '听力' : 
             question.type === 'reading' ? '阅读' : '写作'}
          </span>
          {question.part && (
            <span className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
              第{question.part}部分
            </span>
          )}
        </div>
        
        <h3 className="text-lg font-medium mb-3">{question.question}</h3>
        
        {question.audioUrl && (
          <div className="mb-4">
            <button className="bg-blue-500 text-white px-3 py-1 rounded-md flex items-center">
              <Headphones size={16} className="mr-1" /> 播放音频
            </button>
          </div>
        )}
        
        {question.content && (
          <div className="mb-4 p-3 bg-gray-50 rounded-md whitespace-pre-line">
            {question.content}
          </div>
        )}
        
        {question.imageUrl && (
          <div className="mb-4">
            <img src="/api/placeholder/300/200" alt="题目图片" className="rounded-md" />
          </div>
        )}
        
        {question.options && (
          <div className="mt-4 space-y-2">
            {question.options.map((option, idx) => (
              <div 
                key={idx}
                className={`p-3 rounded-md border cursor-pointer transition-colors ${
                  userAnswers[question.id] === idx 
                    ? 'bg-blue-50 border-blue-300' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => submitAnswer(question.id, idx)}
              >
                <span className="inline-block w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-center leading-6 mr-2">
                  {idx + 1}
                </span>
                {option}
              </div>
            ))}
          </div>
        )}
        
        {question.answer === null && (
          <div className="mt-4">
            <textarea 
              className="w-full p-3 border border-gray-300 rounded-md"
              rows={6}
              placeholder="在此输入你的答案..."
            ></textarea>
          </div>
        )}
      </div>
    );
  };

  // 渲染主页内容
  const renderHome = () => (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">韩语TOPIK练习系统</h2>
        <p className="mb-4">专注于TOPIK考试练习和错题管理的学习助手</p>
        <div className="flex space-x-3">
          <button 
            onClick={() => setActiveTab('practice')} 
            className="bg-white text-blue-600 px-4 py-2 rounded-md font-medium flex items-center"
          >
            <Pencil size={18} className="mr-2" /> 开始练习
          </button>
          <button 
            onClick={() => {
              setActiveTab('wrong');
              setupQuestions('wrong');
            }} 
            className="bg-blue-400 bg-opacity-30 text-white px-4 py-2 rounded-md font-medium flex items-center"
          >
            <XSquare size={18} className="mr-2" /> 错题练习
          </button>
          <button 
            onClick={() => setActiveTab('manage')} 
            className="bg-blue-400 bg-opacity-30 text-white px-4 py-2 rounded-md font-medium flex items-center"
          >
            <Settings size={18} className="mr-2" /> 题库管理
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-3">
            <BookOpen size={20} className="text-blue-500 mr-2" />
            <h3 className="text-lg font-medium">按类型练习</h3>
          </div>
          <p className="text-gray-600">针对不同题型进行专项练习，提高各个方面的能力</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-3">
            <Clock size={20} className="text-blue-500 mr-2" />
            <h3 className="text-lg font-medium">模拟考试</h3>
          </div>
          <p className="text-gray-600">在真实考试环境下进行练习，熟悉考试流程和时间管理</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-3">
            <BarChart size={20} className="text-blue-500 mr-2" />
            <h3 className="text-lg font-medium">错题分析</h3>
          </div>
          <p className="text-gray-600">记录和分析错题，针对性地提高薄弱环节</p>
        </div>
      </div>
      
      {/* 题库统计信息 */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium mb-4">题库信息</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.keys(allQuestions).map(levelKey => {
            const levelData = allQuestions[levelKey];
            const yearCount = Object.keys(levelData).length;
            
            // 计算此级别的总题目数
            let totalCount = 0;
            Object.keys(levelData).forEach(yearKey => {
              const yearData = levelData[yearKey];
              Object.keys(yearData).forEach(typeKey => {
                totalCount += yearData[typeKey].length;
              });
            });
            
            return (
              <div key={levelKey} className="bg-gray-50 p-4 rounded-md">
                <div className="text-sm text-gray-500">
                  {levelKey === 'topik1' ? 'TOPIK I' : 'TOPIK II'}
                </div>
                <div className="font-bold text-xl">{totalCount}</div>
                <div className="text-xs text-gray-500">
                  {yearCount}个年份, {totalCount}道题目
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // 渲染练习设置页面
  const renderPracticeSetup = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-medium mb-6">选择练习方式</h2>
      
      <div className="mb-6">
        <h3 className="text-md font-medium mb-3">TOPIK 级别</h3>
        <div className="flex space-x-3">
          <button 
            onClick={() => setLevel('topik1')}
            className={`px-4 py-2 rounded-md ${
              level === 'topik1' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            TOPIK I (初级)
          </button>
          <button 
            onClick={() => setLevel('topik2')}
            className={`px-4 py-2 rounded-md ${
              level === 'topik2' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            TOPIK II (中高级)
          </button>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-md font-medium mb-3">考试年份</h3>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => setExamYear('2023')}
            className={`px-4 py-2 rounded-md ${
              examYear === '2023' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            2023年
          </button>
          <button 
            onClick={() => setExamYear('2022')}
            className={`px-4 py-2 rounded-md ${
              examYear === '2022' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            2022年
          </button>
          <button 
            onClick={() => setExamYear('2021')}
            className={`px-4 py-2 rounded-md ${
              examYear === '2021' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            2021年
          </button>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-md font-medium mb-3">题型选择</h3>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => setQuestionType('listening')}
            className={`px-4 py-2 rounded-md flex items-center ${
              questionType === 'listening' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Headphones size={16} className="mr-2" /> 听力
          </button>
          <button 
            onClick={() => setQuestionType('reading')}
            className={`px-4 py-2 rounded-md flex items-center ${
              questionType === 'reading' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <BookOpen size={16} className="mr-2" /> 阅读
          </button>
          {level === 'topik2' && (
            <button 
              onClick={() => setQuestionType('writing')}
              className={`px-4 py-2 rounded-md flex items-center ${
                questionType === 'writing' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Pencil size={16} className="mr-2" /> 写作
            </button>
          )}
        </div>
      </div>
      
      <div className="flex space-x-3 mt-8">
        <button 
          onClick={() => setupQuestions('regular')}
          className="bg-blue-500 text-white px-4 py-2 rounded-md font-medium"
        >
          开始练习
        </button>
        <button 
          onClick={() => setupQuestions('mock')}
          className="bg-green-500 text-white px-4 py-2 rounded-md font-medium flex items-center"
        >
          <Clock size={18} className="mr-2" /> 模拟考试
        </button>
        <button 
          onClick={() => setActiveTab('home')}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md"
        >
          返回
        </button>
      </div>
    </div>
  );

  // 渲染练习/考试页面
  const renderExercise = () => {
    if (currentQuestions.length === 0) {
      return <div className="text-center p-8">没有可用的题目</div>;
    }
    
    const currentQuestion = currentQuestions[currentIndex];
    const stats = calculateStats();
    
    return (
      <div>
        {/* 顶部信息条 */}
        <div className="flex justify-between items-center mb-4 bg-gray-50 p-3 rounded-md">
          <div>
            {practiceMode === 'mock' ? '模拟考试' : practiceMode === 'wrong' ? '错题练习' : '题型练习'} | 
            {` ${currentIndex + 1} / ${currentQuestions.length} 题`}
          </div>
          {timerActive && (
            <div className="flex items-center">
              <Clock size={16} className="mr-1 text-blue-500" />
              <span className={timeRemaining < 300 ? 'text-red-500 font-medium' : ''}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          )}
        </div>
        
        {!showResults ? (
          <>
            <QuestionRenderer question={currentQuestion} />
            
            <div className="flex justify-between mt-6">
              <button 
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className={`px-4 py-2 rounded-md ${
                  currentIndex === 0 
                    ? 'bg-gray-100 text-gray-400' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                上一题
              </button>
              
              {currentIndex < currentQuestions.length - 1 ? (
                <button 
                  onClick={() => setCurrentIndex(currentIndex + 1)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md"
                >
                  下一题
                </button>
              ) : (
                <button 
                  onClick={finishExercise}
                  className="bg-green-500 text-white px-4 py-2 rounded-md"
                >
                  完成练习
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-medium mb-4 flex items-center">
              <CheckSquare size={24} className="text-green-500 mr-2" /> 
              练习结果
            </h2>
            
            <div className="mb-6 grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-md">
                <div className="text-sm text-blue-700">正确率</div>
                <div className="text-2xl font-bold">{stats.percentage}%</div>
              </div>
              <div className="bg-green-50 p-4 rounded-md">
                <div className="text-sm text-green-700">正确数量</div>
                <div className="text-2xl font-bold">{stats.correct} / {currentQuestions.filter(q => q.answer !== null).length}</div>
              </div>
            </div>
            
            <h3 className="text-lg font-medium mb-3">题目详情：</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {currentQuestions.map((q, idx) => {
                // 跳过没有标准答案的题目（如写作题）
                if (q.answer === null) return null;
                
                const isCorrect = userAnswers[q.id] === q.answer;
                
                return (
                  <div 
                    key={q.id} 
                    className={`p-3 border rounded-md ${
                      isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex justify-between">
                      <div>
                        <span className="inline-block w-6 h-6 rounded-full text-center leading-6 mr-2 text-xs font-medium bg-gray-100">
                          {idx + 1}
                        </span>
                        {q.question.length > 50 ? q.question.substring(0, 50) + '...' : q.question}
                      </div>
                      {isCorrect ? (
                        <CheckSquare size={18} className="text-green-500" />
                      ) : (
                        <XSquare size={18} className="text-red-500" />
                      )}
                    </div>
                    
                    {!isCorrect && (
                      <div className="mt-2 text-sm">
                        <div className="text-red-600">
                          你的答案: {q.options && q.options[userAnswers[q.id]]}
                        </div>
                        <div className="text-green-600">
                          正确答案: {q.options && q.options[q.answer]}
                        </div>
                        {q.explanation && (
                          <div className="mt-1 p-2 bg-gray-50 rounded text-gray-700">
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button 
                onClick={() => {
                  setActiveTab('practice');
                  setShowResults(false);
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
              >
                新的练习
              </button>
              <button 
                onClick={() => setActiveTab('home')}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md"
              >
                返回首页
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // 渲染统计分析页面
  const renderStats = () => {
    // 计算题目总数
    const countQuestions = () => {
      let total = 0;
      
      // 遍历所有年份和题型
      Object.keys(sampleQuestions).forEach(levelKey => {
        const levelData = sampleQuestions[levelKey];
        Object.keys(levelData).forEach(yearKey => {
          const yearData = levelData[yearKey];
          Object.keys(yearData).forEach(typeKey => {
            total += yearData[typeKey].length;
          });
        });
      });
      
      return total;
    };
    
    const totalQuestions = countQuestions();
    
    const correctPercentage = wrongAnswers.length > 0 
      ? Math.round(((totalQuestions - wrongAnswers.length) / totalQuestions) * 100)
      : 100;
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-medium mb-6">学习分析</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-md">
            <div className="text-sm text-blue-700">已练习题目</div>
            <div className="text-2xl font-bold">{totalQuestions}</div>
          </div>
          <div className="bg-red-50 p-4 rounded-md">
            <div className="text-sm text-red-700">错题数量</div>
            <div className="text-2xl font-bold">{wrongAnswers.length}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-md">
            <div className="text-sm text-green-700">总正确率</div>
            <div className="text-2xl font-bold">{correctPercentage}%</div>
          </div>
        </div>
        
        <h3 className="text-lg font-medium mb-3">薄弱区域分析</h3>
        
        <div className="space-y-4">
          {wrongAnswers.length > 0 ? (
            <>
              <div className="flex items-center mb-2">
                <div className="w-32">听力题错题：</div>
                <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{
                    width: `${Math.round((wrongAnswers.filter(q => q.id.startsWith('l')).length / wrongAnswers.length) * 100)}%`
                  }}></div>
                </div>
                <div className="ml-2 text-sm">
                  {wrongAnswers.filter(q => q.id.startsWith('l')).length} 题
                </div>
              </div>
              
              <div className="flex items-center mb-2">
                <div className="w-32">阅读题错题：</div>
                <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{
                    width: `${Math.round((wrongAnswers.filter(q => q.id.startsWith('r')).length / wrongAnswers.length) * 100)}%`
                  }}></div>
                </div>
                <div className="ml-2 text-sm">
                  {wrongAnswers.filter(q => q.id.startsWith('r')).length} 题
                </div>
              </div>
              
              <button 
                onClick={() => {
                  setActiveTab('wrong');
                  setupQuestions('wrong');
                }} 
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md flex items-center"
              >
                <Pencil size={16} className="mr-2" /> 练习错题
              </button>
            </>
          ) : (
            <div className="text-gray-500 p-4 bg-gray-50 rounded-md">
              还没有错题记录，继续加油！
            </div>
          )}
        </div>
      </div>
    );
  };

  // 渲染题库管理页面
  const renderManage = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-medium mb-4">题库管理</h2>
      
      {/* 添加新题目 */}
      <AddQuestionForm onAddQuestion={handleAddQuestion} />
      
      {/* 导入/导出题库 */}
      <ImportExportTool 
        currentQuestions={allQuestions} 
        updateQuestions={setAllQuestions} 
      />
      
      {/* 题库统计 */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium mb-4">题库结构</h3>
        <div className="max-h-96 overflow-y-auto p-3 bg-gray-50 rounded-md">
          {Object.keys(allQuestions).map(levelKey => (
            <div key={levelKey} className="mb-4">
              <h4 className="font-medium">{levelKey === 'topik1' ? 'TOPIK I (初级)' : 'TOPIK II (中高级)'}</h4>
              {Object.keys(allQuestions[levelKey]).length > 0 ? (
                <ul className="ml-4">
                  {Object.keys(allQuestions[levelKey]).map(yearKey => (
                    <li key={yearKey} className="my-2">
                      <span className="font-medium">{yearKey}年:</span>
                      <ul className="ml-4">
                        {Object.keys(allQuestions[levelKey][yearKey]).map(typeKey => (
                          <li key={typeKey}>
                            {typeKey === 'listening' ? '听力' : 
                             typeKey === 'reading' ? '阅读' : '写作'}: 
                            {allQuestions[levelKey][yearKey][typeKey].length}道题
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 ml-4">暂无数据</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // 渲染主要内容
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return renderHome();
      case 'practice':
        return currentQuestions.length > 0 ? renderExercise() : renderPracticeSetup();
      case 'wrong':
        return wrongAnswers.length > 0 ? renderExercise() : (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-gray-500 mb-4">暂时没有错题记录</div>
            <button 
              onClick={() => setActiveTab('practice')} 
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              开始练习
            </button>
          </div>
        );
      case 'stats':
        return renderStats();
      case 'manage':
        return renderManage();
      default:
        return renderHome();
    }
  };

  // 应用主布局
  return (
    <div className="min-h-screen bg-gray-100">
      {/* 导航栏 */}
      <nav className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="font-bold text-lg text-blue-600">TOPIK 练习</span>
            </div>
            <div className="flex items-center space-x-1">
              <button 
                onClick={() => setActiveTab('home')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'home' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title="首页"
              >
                <Home size={18} />
              </button>
              <button 
                onClick={() => setActiveTab('practice')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'practice' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title="练习"
              >
                <Pencil size={18} />
              </button>
              <button 
                onClick={() => {
                  setActiveTab('wrong');
                  setupQuestions('wrong');
                }}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'wrong' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title="错题练习"
              >
                <XSquare size={18} />
              </button>
              <button 
                onClick={() => setActiveTab('stats')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'stats' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title="学习分析"
              >
                <BarChart size={18} />
              </button>
              <button 
                onClick={() => setActiveTab('manage')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'manage' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title="题库管理"
              >
                <Settings size={18} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容区域 */}
      <main className="max-w-4xl mx-auto p-4">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
